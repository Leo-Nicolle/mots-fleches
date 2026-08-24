import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { adminMiddleware } from '../middleware/admin';
import { computeGridProgress, GridProgress } from '../services/grid-progress';

const router = Router();

router.use(adminMiddleware);

// ============ SUMMARY ============

router.get('/summary', async (_req: Request, res: Response) => {
  const [totalUsers, totalGrids, totalStyles, users] = await Promise.all([
    prisma.users.count(),
    prisma.crosswords.count(),
    prisma.styles.count(),
    prisma.users.findMany({
      select: { id: true, email: true, pseudo: true, created_at: true },
      orderBy: { created_at: 'asc' },
    }),
  ]);

  const gridCounts = await prisma.crosswords.groupBy({
    by: ['user_id'],
    _count: { _all: true },
  });
  const styleCounts = await prisma.styles.groupBy({
    by: ['user_id'],
    _count: { _all: true },
  });

  const gridsPerUser = gridCounts
    .filter((g) => g.user_id !== null)
    .map((g) => ({ userId: g.user_id, count: g._count._all }));
  const stylesPerUser = styleCounts
    .filter((s) => s.user_id !== null)
    .map((s) => ({ userId: s.user_id, count: s._count._all }));

  const signupsOverTime = users.reduce((acc: Record<string, number>, u) => {
    if (!u.created_at) return acc;
    const key = u.created_at.toISOString().slice(0, 10);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalUsers,
    totalGrids,
    totalStyles,
    gridsPerUser,
    stylesPerUser,
    signupsOverTime,
  });
});

// ============ USERS ============

router.get('/users', async (_req: Request, res: Response) => {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      email: true,
      pseudo: true,
      created_at: true,
      last_connection: true,
      status: true,
      tier_id: true,
      disk_usage: true,
      _count: { select: { crosswords: true, styles: true, books: true, fonts: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      pseudo: u.pseudo,
      createdAt: u.created_at ? u.created_at.getTime() : null,
      lastConnection: u.last_connection ? u.last_connection.getTime() : null,
      status: u.status,
      tierId: u.tier_id,
      diskUsage: u.disk_usage?.toString() ?? '0',
      gridCount: u._count.crosswords,
      styleCount: u._count.styles,
      bookCount: u._count.books,
      fontCount: u._count.fonts,
    }))
  );
});

// ============ USER GRIDS ============

router.get('/users/:id/grids', async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  if (Number.isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  const crosswords = await prisma.crosswords.findMany({
    where: { user_id: userId },
    select: { content: true, updated_at: true, created_at: true },
    orderBy: { updated_at: 'desc' },
  });

  const grids = crosswords
    .map((c) => computeGridProgress(c.content, c.updated_at ?? c.created_at))
    .filter((g): g is GridProgress => g !== null);

  res.json(grids);
});

// ============ GRID DETAIL ============

router.get('/grids/:id', async (req: Request, res: Response) => {
  const results = await prisma.$queryRaw<{ content: string; updated_at: Date | null }[]>`
    SELECT content, updated_at FROM crosswords
    WHERE content::jsonb->>'id' = ${req.params.id}
    LIMIT 1
  `;
  if (!results.length) {
    res.status(404).json({ error: 'Grid not found' });
    return;
  }
  const content = JSON.parse(results[0].content);
  res.json({
    content,
    progress: computeGridProgress(results[0].content, results[0].updated_at),
  });
});

export default router;
