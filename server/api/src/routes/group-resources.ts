import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { users as User } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

async function isMember(userId: number, groupId: number): Promise<boolean> {
  const m = await prisma.groupmembers.findUnique({
    where: { user_id_group_id: { user_id: userId, group_id: groupId } },
  });
  return m !== null;
}

/** Auto-share a style (by client_id) owned by userId to groupId, if it exists. */
async function autoShareStyle(clientId: string, userId: number, groupId: number) {
  const style = await prisma.styles.findFirst({ where: { client_id: clientId, user_id: userId } });
  if (!style) return;
  await prisma.styleshares.upsert({
    where: { style_id_group_id: { style_id: style.id, group_id: groupId } },
    create: { style_id: style.id, group_id: groupId },
    update: {},
  });
}

// ── GET single group resource ─────────────────────────────────────────────────

router.get('/group/:id/style/:clientId', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);

  if (!(await isMember(user.id, groupId))) {
    res.status(403).json({ error: 'Not a member of this group' });
    return;
  }

  const share = await prisma.styleshares.findFirst({
    where: { group_id: groupId, styles: { client_id: req.params.clientId } },
    include: { styles: true },
  });
  if (!share) {
    res.status(404).json({ error: 'Style not found in this group' });
    return;
  }
  res.json(share.styles.data);
});

// ── GET group resources ───────────────────────────────────────────────────────

router.get('/group/:id/grids', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);

  if (!(await isMember(user.id, groupId))) {
    res.status(403).json({ error: 'Not a member of this group' });
    return;
  }

  const rows = await prisma.crosswords.findMany({ where: { group_id: groupId } });
  res.json(rows.map((r) => JSON.parse(r.content)));
});

router.get('/group/:id/books', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);

  if (!(await isMember(user.id, groupId))) {
    res.status(403).json({ error: 'Not a member of this group' });
    return;
  }

  const rows = await prisma.books.findMany({ where: { group_id: groupId } });
  res.json(rows.map((r) => r.grid_ids));
});

router.get('/group/:id/styles', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);

  if (!(await isMember(user.id, groupId))) {
    res.status(403).json({ error: 'Not a member of this group' });
    return;
  }

  const shares = await prisma.styleshares.findMany({
    where: { group_id: groupId },
    include: { styles: true },
  });
  res.json(shares.map((s) => s.styles.data));
});

// ── Get sharing state ─────────────────────────────────────────────────────────

router.get('/grid/:id/sharing', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const result = await prisma.$queryRaw<{ group_id: number | null }[]>`
    SELECT group_id FROM crosswords
    WHERE user_id = ${user.id} AND content::jsonb->>'id' = ${req.params.id}
  `;
  if (!result.length) { res.status(404).json({ error: 'Grid not found' }); return; }
  res.json({ group_id: result[0].group_id });
});

router.get('/book/:id/sharing', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const result = await prisma.$queryRaw<{ group_id: number | null }[]>`
    SELECT group_id FROM books
    WHERE user_id = ${user.id} AND grid_ids::jsonb->>'id' = ${req.params.id}
  `;
  if (!result.length) { res.status(404).json({ error: 'Book not found' }); return; }
  res.json({ group_id: result[0].group_id });
});

router.get('/style/:id/sharing', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const style = await prisma.styles.findFirst({
    where: { client_id: req.params.id, user_id: user.id },
    include: { styleshares: { select: { group_id: true } } },
  });
  if (!style) { res.status(404).json({ error: 'Style not found' }); return; }
  res.json({ group_ids: style.styleshares.map((s) => s.group_id) });
});

// ── Share / Unshare grids ─────────────────────────────────────────────────────

router.post('/group/:id/grid/:gridId/share', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);
  const gridId = req.params.gridId;

  if (!(await isMember(user.id, groupId))) {
    res.status(403).json({ error: 'Not a member of this group' });
    return;
  }

  const result = await prisma.$executeRaw`
    UPDATE crosswords
    SET group_id = ${groupId}
    WHERE user_id = ${user.id} AND content::jsonb->>'id' = ${gridId}
  `;
  if (result === 0) {
    res.status(404).json({ error: 'Grid not found or not owned by you' });
    return;
  }

  // Auto-share the style referenced by this grid
  const grid = await prisma.$queryRaw<{ styleId: string }[]>`
    SELECT content::jsonb->>'styleId' AS "styleId" FROM crosswords
    WHERE user_id = ${user.id} AND content::jsonb->>'id' = ${gridId}
  `;
  if (grid.length && grid[0].styleId) {
    await autoShareStyle(grid[0].styleId, user.id, groupId);
  }

  res.json({ success: true });
});

router.delete('/group/:id/grid/:gridId/share', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const gridId = req.params.gridId;

  const result = await prisma.$executeRaw`
    UPDATE crosswords
    SET group_id = NULL
    WHERE user_id = ${user.id} AND content::jsonb->>'id' = ${gridId}
  `;
  if (result === 0) {
    res.status(404).json({ error: 'Grid not found or not owned by you' });
    return;
  }
  res.json({ success: true });
});

// ── Share / Unshare books ─────────────────────────────────────────────────────

router.post('/group/:id/book/:bookId/share', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);
  const bookId = req.params.bookId;

  if (!(await isMember(user.id, groupId))) {
    res.status(403).json({ error: 'Not a member of this group' });
    return;
  }

  const result = await prisma.$executeRaw`
    UPDATE books
    SET group_id = ${groupId}
    WHERE user_id = ${user.id} AND grid_ids::jsonb->>'id' = ${bookId}
  `;
  if (result === 0) {
    res.status(404).json({ error: 'Book not found or not owned by you' });
    return;
  }

  // Auto-share style and solutionStyle referenced by this book
  const book = await prisma.$queryRaw<{ style: string; solutionStyle: string }[]>`
    SELECT grid_ids::jsonb->>'style' AS style, grid_ids::jsonb->>'solutionStyle' AS "solutionStyle"
    FROM books
    WHERE user_id = ${user.id} AND grid_ids::jsonb->>'id' = ${bookId}
  `;
  if (book.length) {
    const { style, solutionStyle } = book[0];
    if (style) await autoShareStyle(style, user.id, groupId);
    if (solutionStyle) await autoShareStyle(solutionStyle, user.id, groupId);
  }

  res.json({ success: true });
});

router.delete('/group/:id/book/:bookId/share', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const bookId = req.params.bookId;

  const result = await prisma.$executeRaw`
    UPDATE books
    SET group_id = NULL
    WHERE user_id = ${user.id} AND grid_ids::jsonb->>'id' = ${bookId}
  `;
  if (result === 0) {
    res.status(404).json({ error: 'Book not found or not owned by you' });
    return;
  }
  res.json({ success: true });
});

// ── Share / Unshare styles ────────────────────────────────────────────────────

router.post('/group/:id/style/:styleId/share', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);
  const styleId = req.params.styleId;

  if (!(await isMember(user.id, groupId))) {
    res.status(403).json({ error: 'Not a member of this group' });
    return;
  }

  const existing = await prisma.styles.findFirst({
    where: { client_id: styleId, user_id: user.id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Style not found or not owned by you' });
    return;
  }

  await prisma.styleshares.upsert({
    where: { style_id_group_id: { style_id: existing.id, group_id: groupId } },
    create: { style_id: existing.id, group_id: groupId },
    update: {},
  });
  res.json({ success: true });
});

router.delete('/group/:id/style/:styleId/share', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);
  const styleId = req.params.styleId;

  const existing = await prisma.styles.findFirst({
    where: { client_id: styleId, user_id: user.id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Style not found or not owned by you' });
    return;
  }

  await prisma.styleshares.deleteMany({
    where: { style_id: existing.id, group_id: groupId },
  });
  res.json({ success: true });
});

// ── GET group fonts ───────────────────────────────────────────────────────────

router.get('/group/:id/fonts', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);

  if (!(await isMember(user.id, groupId))) {
    res.status(403).json({ error: 'Not a member of this group' });
    return;
  }

  const rows = await prisma.fonts.findMany({ where: { group_id: groupId } });
  res.json(rows.map((f) => ({
    family: f.name,
    content: f.file_url,
    updated: f.created_at ? f.created_at.getTime() : 0,
  })));
});

router.get('/font/:name/sharing', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const font = await prisma.fonts.findFirst({
    where: { name: req.params.name, user_id: user.id },
    select: { group_id: true },
  });
  if (!font) { res.status(404).json({ error: 'Font not found' }); return; }
  res.json({ group_id: font.group_id });
});

// ── Share / Unshare fonts ─────────────────────────────────────────────────────

router.post('/group/:id/font/:name/share', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const groupId = parseInt(req.params.id);

  if (!(await isMember(user.id, groupId))) {
    res.status(403).json({ error: 'Not a member of this group' });
    return;
  }

  const existing = await prisma.fonts.findFirst({
    where: { name: req.params.name, user_id: user.id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Font not found or not owned by you' });
    return;
  }

  await prisma.fonts.update({ where: { id: existing.id }, data: { group_id: groupId } });
  res.json({ success: true });
});

router.delete('/group/:id/font/:name/share', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;

  const existing = await prisma.fonts.findFirst({
    where: { name: req.params.name, user_id: user.id },
  });
  if (!existing) {
    res.status(404).json({ error: 'Font not found or not owned by you' });
    return;
  }

  await prisma.fonts.update({ where: { id: existing.id }, data: { group_id: null } });
  res.json({ success: true });
});

export default router;
