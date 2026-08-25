import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { users as User } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// ============ GRIDS ============

router.get('/grids', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const crosswords = await prisma.crosswords.findMany({
    where: { user_id: user.id },
  });
  res.json(crosswords.map((c) => JSON.parse(c.content)));
});

router.get('/grid/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const results = await prisma.$queryRaw<{ content: string }[]>`
    SELECT c.content FROM crosswords c
    WHERE c.content::jsonb->>'id' = ${req.params.id}
      AND (
        c.user_id = ${user.id}
        OR EXISTS (
          SELECT 1 FROM crosswordshares cs
          JOIN groupmembers gm ON gm.group_id = cs.group_id
          WHERE cs.crossword_id = c.id AND gm.user_id = ${user.id}
        )
        OR EXISTS (
          SELECT 1 FROM books b
          JOIN bookshares bs ON bs.book_id = b.id
          JOIN groupmembers gm ON gm.group_id = bs.group_id
          WHERE gm.user_id = ${user.id}
            AND b.grid_ids::jsonb->'grids' @> to_jsonb(${req.params.id}::text)
        )
      )
    LIMIT 1
  `;
  if (!results.length) {
    res.status(404).json({ error: 'Grid not found' });
    return;
  }
  res.json(JSON.parse(results[0].content));
});

router.post('/grid', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const grid = req.body;
  const content = JSON.stringify(grid);

  // 1. Check if the user owns a row with this client_id
  const owned = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM crosswords
    WHERE user_id = ${user.id} AND content::jsonb->>'id' = ${grid.id}
  `;
  if (owned.length) {
    await prisma.crosswords.update({
      where: { id: owned[0].id },
      data: { content, updated_at: new Date() },
    });
    res.json(grid.id);
    return;
  }

  // 2. Check if a shared row is accessible via the user's group membership
  const shared = await prisma.$queryRaw<{ id: number }[]>`
    SELECT c.id FROM crosswords c
    JOIN crosswordshares cs ON cs.crossword_id = c.id
    JOIN groupmembers gm ON gm.group_id = cs.group_id
    WHERE gm.user_id = ${user.id} AND c.content::jsonb->>'id' = ${grid.id}
    LIMIT 1
  `;
  if (shared.length) {
    await prisma.crosswords.update({
      where: { id: shared[0].id },
      data: { content, updated_at: new Date() },
    });
    res.json(grid.id);
    return;
  }

  // 3. Create a new row owned by this user
  await prisma.crosswords.create({
    data: { content, user_id: user.id },
  });
  res.json(grid.id);
});

router.delete('/grid/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  await prisma.$executeRaw`
    DELETE FROM crosswords
    WHERE user_id = ${user.id} AND content::jsonb->>'id' = ${req.params.id}
  `;
  res.json({ success: true });
});

// ============ BOOKS ============
// grid_ids column stores the full serialized Book object

router.get('/books', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const books = await prisma.books.findMany({ where: { user_id: user.id } });
  res.json(books.map((b) => b.grid_ids));
});

router.get('/book/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const results = await prisma.$queryRaw<{ grid_ids: unknown }[]>`
    SELECT b.grid_ids FROM books b
    WHERE b.grid_ids::jsonb->>'id' = ${req.params.id}
      AND (
        b.user_id = ${user.id}
        OR EXISTS (
          SELECT 1 FROM bookshares bs
          JOIN groupmembers gm ON gm.group_id = bs.group_id
          WHERE bs.book_id = b.id AND gm.user_id = ${user.id}
        )
      )
    LIMIT 1
  `;
  if (!results.length) {
    res.status(404).json({ error: 'Book not found' });
    return;
  }
  res.json(results[0].grid_ids);
});

router.get('/book/:id/ownership', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const book = await prisma.$queryRaw<{ id: number }[]>`
    SELECT b.id FROM books b
    WHERE b.grid_ids::jsonb->>'id' = ${req.params.id}
      AND (
        b.user_id = ${user.id}
        OR EXISTS (
          SELECT 1 FROM bookshares bs
          JOIN groupmembers gm ON gm.group_id = bs.group_id
          WHERE bs.book_id = b.id AND gm.user_id = ${user.id}
        )
      )
    LIMIT 1
  `;
  if (!book.length) {
    res.json({ owned: false, group_ids: [] });
    return;
  }
  const owned = (await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM books WHERE user_id = ${user.id} AND grid_ids::jsonb->>'id' = ${req.params.id}
  `)[0].count > 0n;
  const shares = await prisma.bookshares.findMany({
    where: { book_id: book[0].id },
    select: { group_id: true },
  });
  res.json({ owned, group_ids: shares.map((s) => s.group_id) });
});

router.post('/book', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const bookData = req.body.data ?? req.body;
  const bookId = req.body.id ?? bookData.id;

  // 1. Check if the user owns a row with this client_id
  const owned = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM books
    WHERE user_id = ${user.id} AND grid_ids::jsonb->>'id' = ${bookId}
  `;
  if (owned.length) {
    await prisma.$executeRaw`
      UPDATE books
      SET name = ${bookData.title ?? bookId}, grid_ids = ${JSON.stringify(bookData)}::jsonb
      WHERE id = ${owned[0].id}
    `;
    res.json(bookId);
    return;
  }

  // 2. Check if a shared row is accessible via the user's group membership
  const shared = await prisma.$queryRaw<{ id: number }[]>`
    SELECT b.id FROM books b
    JOIN bookshares bs ON bs.book_id = b.id
    JOIN groupmembers gm ON gm.group_id = bs.group_id
    WHERE gm.user_id = ${user.id} AND b.grid_ids::jsonb->>'id' = ${bookId}
    LIMIT 1
  `;
  if (shared.length) {
    await prisma.$executeRaw`
      UPDATE books
      SET name = ${bookData.title ?? bookId}, grid_ids = ${JSON.stringify(bookData)}::jsonb
      WHERE id = ${shared[0].id}
    `;
    res.json(bookId);
    return;
  }

  // 3. Create a new row owned by this user
  await prisma.books.create({
    data: { name: bookData.title ?? bookId, grid_ids: bookData, user_id: user.id },
  });
  res.json(bookId);
});

router.delete('/book/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  await prisma.$executeRaw`
    DELETE FROM books
    WHERE user_id = ${user.id} AND grid_ids::jsonb->>'id' = ${req.params.id}
  `;
  res.json({ success: true });
});

// ============ STYLES ============

router.get('/styles', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const styles = await prisma.styles.findMany({ where: { user_id: user.id } });
  res.json(styles.map((s) => s.data));
});

router.get('/style/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const style = await prisma.styles.findFirst({
    where: { client_id: req.params.id as string, user_id: user.id },
  });
  if (!style) {
    res.status(404).json({ error: 'Style not found' });
    return;
  }
  res.json(style.data);
});

router.post('/style', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const style = req.body;
  const existing = await prisma.styles.findFirst({
    where: { client_id: style.id, user_id: user.id },
  });
  if (existing) {
    await prisma.styles.update({ where: { id: existing.id }, data: { data: style } });
  } else {
    await prisma.styles.create({ data: { client_id: style.id, data: style, user_id: user.id } });
  }
  res.json(style.id);
});

router.delete('/style/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  await prisma.styles.deleteMany({
    where: { client_id: req.params.id as string, user_id: user.id },
  });
  res.json({ success: true });
});

// ============ CUSTOM WORDS ============

router.get('/words', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const words = await prisma.customwords.findMany({ where: { user_id: user.id } });
  res.json(words.map((w) => w.word));
});

router.get('/word/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const word = await prisma.customwords.findFirst({
    where: { word: req.params.id as string, user_id: user.id },
  });
  if (!word) {
    res.status(404).json({ error: 'Word not found' });
    return;
  }
  res.json(word.word);
});

router.post('/word', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const word: string = req.body.word;
  if (!word || typeof word !== 'string') {
    res.status(400).json({ error: 'Word is required' });
    return;
  }
  const existing = await prisma.customwords.findFirst({
    where: { word, user_id: user.id },
  });
  if (!existing) {
    await prisma.customwords.create({ data: { word, user_id: user.id } });
  }
  res.json(word);
});

router.delete('/word/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  await prisma.customwords.deleteMany({
    where: { word: req.params.id as string, user_id: user.id },
  });
  res.json({ success: true });
});

// ============ BANNED WORDS ============

router.get('/banned-words', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const words = await prisma.bannedwords.findMany({ where: { user_id: user.id } });
  res.json(words.map((w) => w.word));
});

router.get('/banned-word/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const word = await prisma.bannedwords.findFirst({
    where: { word: req.params.id as string, user_id: user.id },
  });
  if (!word) {
    res.status(404).json({ error: 'Banned word not found' });
    return;
  }
  res.json(word.word);
});

router.post('/banned-word', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const word: string = req.body.word;
  if (!word || typeof word !== 'string') {
    res.status(400).json({ error: 'Word is required' });
    return;
  }
  const existing = await prisma.bannedwords.findFirst({
    where: { word, user_id: user.id },
  });
  if (!existing) {
    await prisma.bannedwords.create({ data: { word, user_id: user.id } });
  }
  res.json(word);
});

router.delete('/banned-word/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  await prisma.bannedwords.deleteMany({
    where: { word: req.params.id as string, user_id: user.id },
  });
  res.json({ success: true });
});

// ============ FONTS ============

router.get('/fonts', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const fonts = await prisma.fonts.findMany({ where: { user_id: user.id } });
  res.json(
    fonts.map((f) => ({
      family: f.name,
      content: f.file_url,
      updated: f.created_at ? f.created_at.getTime() : 0,
    }))
  );
});

router.get('/font/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const font = await prisma.fonts.findFirst({
    where: { name: req.params.id as string, user_id: user.id },
  });
  if (!font) {
    res.status(404).json({ error: 'Font not found' });
    return;
  }
  res.json({ family: font.name, content: font.file_url, updated: font.created_at?.getTime() ?? 0 });
});

router.post('/font', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const font = req.body as { family: string; content: string; updated: number };
  const existing = await prisma.fonts.findFirst({
    where: { name: font.family, user_id: user.id },
  });
  if (existing) {
    await prisma.fonts.update({
      where: { id: existing.id },
      data: { file_url: font.content },
    });
  } else {
    await prisma.fonts.create({
      data: { name: font.family, file_url: font.content, user_id: user.id },
    });
  }
  res.json(font.family);
});

router.delete('/font/:id', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  await prisma.fonts.deleteMany({
    where: { name: req.params.id as string, user_id: user.id },
  });
  res.json({ success: true });
});

export default router;
