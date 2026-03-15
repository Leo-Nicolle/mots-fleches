import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';

vi.mock('../src/services/stripe', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/stripe')>();
  return {
    ...actual,
    getCustommer: vi.fn().mockResolvedValue(null),
    createCustommer: vi.fn().mockResolvedValue({ id: 'cus_test_mock' }),
  };
});

import authRouter from '../src/routes/auth';
import gridRouter from '../src/routes/grid';
import groupsRouter from '../src/routes/groups';
import groupResourcesRouter from '../src/routes/group-resources';
import passport from '../src/config/passport';
import { hashPassword } from '../src/services/auth';
import prisma from '../src/prisma';

const app = express();
app.use(express.json());
passport(app);
app.use('/api/auth', authRouter);
app.use('/api/', gridRouter);
app.use('/api/', groupsRouter);
app.use('/api/', groupResourcesRouter);

// ── Fixtures ──────────────────────────────────────────────────────────────────

const OWNER = { email: 'owner@sharing.test', password: 'password123' };
const MEMBER = { email: 'member@sharing.test', password: 'password123' };
const OUTSIDER = { email: 'outsider@sharing.test', password: 'password123' };

let ownerToken = '';
let memberToken = '';
let outsiderToken = '';
let groupId = 0;
let groupId2 = 0;

const GRID_ID = 'grid-sharing-test-1';
const GRID_CONTENT = { id: GRID_ID, styleId: 'style-for-grid', cells: [] };

const BOOK_ID = 'book-sharing-test-1';
const BOOK_DATA = { id: BOOK_ID, title: 'Test Book', style: 'style-for-book', solutionStyle: 'style-solution', grids: [] };

async function login(email: string, password: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.accessToken;
}

beforeAll(async () => {
  const hash = await hashPassword(OWNER.password);
  await prisma.users.createMany({
    data: [
      { email: OWNER.email, password: hash, tier_id: 1 },
      { email: MEMBER.email, password: hash, tier_id: 1 },
      { email: OUTSIDER.email, password: hash, tier_id: 1 },
    ],
    skipDuplicates: true,
  });

  [ownerToken, memberToken, outsiderToken] = await Promise.all([
    login(OWNER.email, OWNER.password),
    login(MEMBER.email, MEMBER.password),
    login(OUTSIDER.email, OUTSIDER.password),
  ]);

  // Owner creates two groups and adds member to both
  const g1 = await request(app)
    .post('/api/group')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'SharingGroup1' });
  groupId = g1.body.id;

  const g2 = await request(app)
    .post('/api/group')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'SharingGroup2' });
  groupId2 = g2.body.id;

  await request(app)
    .post(`/api/group/${groupId}/member`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ email: MEMBER.email });

  await request(app)
    .post(`/api/group/${groupId2}/member`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ email: MEMBER.email });

  // Owner creates a grid and a book
  await request(app)
    .post('/api/grid')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send(GRID_CONTENT);

  await request(app)
    .post('/api/book')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send(BOOK_DATA);

  // Owner creates styles referenced by grid and book
  await request(app)
    .post('/api/style')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ id: 'style-for-grid' });

  await request(app)
    .post('/api/style')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ id: 'style-for-book' });

  await request(app)
    .post('/api/style')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ id: 'style-solution' });
});

// ── Grid sharing ──────────────────────────────────────────────────────────────

describe('Grid sharing', () => {
  it('owner can share grid to a group', async () => {
    const res = await request(app)
      .post(`/api/group/${groupId}/grid/${GRID_ID}/share`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify join table row exists
    const row = await prisma.$queryRaw<{ crossword_id: number }[]>`
      SELECT cs.crossword_id FROM crosswordshares cs
      JOIN groupmembers gm ON gm.group_id = cs.group_id
      WHERE gm.user_id = (SELECT id FROM users WHERE email = ${OWNER.email})
        AND cs.group_id = ${groupId}
    `;
    expect(row.length).toBeGreaterThan(0);
  });

  it('shared grid appears in GET /group/:id/grids for member', async () => {
    const res = await request(app)
      .get(`/api/group/${groupId}/grids`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    const ids = res.body.map((g: { id: string }) => g.id);
    expect(ids).toContain(GRID_ID);
  });

  it('GET /grid/:id/sharing returns group_ids array', async () => {
    const res = await request(app)
      .get(`/api/grid/${GRID_ID}/sharing`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.group_ids).toContain(groupId);
  });

  it('owner can share same grid to a second group (multi-group)', async () => {
    await request(app)
      .post(`/api/group/${groupId2}/grid/${GRID_ID}/share`)
      .set('Authorization', `Bearer ${ownerToken}`);

    const res = await request(app)
      .get(`/api/grid/${GRID_ID}/sharing`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.body.group_ids).toContain(groupId);
    expect(res.body.group_ids).toContain(groupId2);
  });

  it('unsharing from one group leaves the other intact and removes the DB row', async () => {
    await request(app)
      .delete(`/api/group/${groupId2}/grid/${GRID_ID}/share`)
      .set('Authorization', `Bearer ${ownerToken}`);

    // API-level check
    const res = await request(app)
      .get(`/api/grid/${GRID_ID}/sharing`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.body.group_ids).toContain(groupId);
    expect(res.body.group_ids).not.toContain(groupId2);

    // Direct DB check: the crosswordshares row for groupId2 must be gone
    const crosswordRow = await prisma.$queryRaw<{ id: number }[]>`
      SELECT c.id FROM crosswords c WHERE c.content::jsonb->>'id' = ${GRID_ID}
    `;
    const shareCount = await prisma.crosswordshares.count({
      where: { crossword_id: crosswordRow[0].id, group_id: groupId2 },
    });
    expect(shareCount).toBe(0);

    // The share for groupId must still exist
    const remainingCount = await prisma.crosswordshares.count({
      where: { crossword_id: crosswordRow[0].id, group_id: groupId },
    });
    expect(remainingCount).toBe(1);
  });

  it('non-owner cannot share another user\'s grid', async () => {
    const res = await request(app)
      .post(`/api/group/${groupId}/grid/${GRID_ID}/share`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(404);
  });

  it('non-member cannot share to a group they don\'t belong to', async () => {
    const res = await request(app)
      .post(`/api/group/${groupId}/grid/${GRID_ID}/share`)
      .set('Authorization', `Bearer ${outsiderToken}`);
    expect(res.status).toBe(403);
  });

  it('sharing a grid auto-shares its styleId', async () => {
    const share = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM styleshares ss
      JOIN styles s ON s.id = ss.style_id
      WHERE s.client_id = 'style-for-grid' AND ss.group_id = ${groupId}
    `;
    expect(Number(share[0].count)).toBeGreaterThan(0);
  });
});

// ── Book sharing ──────────────────────────────────────────────────────────────

describe('Book sharing', () => {
  it('owner can share book to a group', async () => {
    const res = await request(app)
      .post(`/api/group/${groupId}/book/${BOOK_ID}/share`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('shared book appears in GET /group/:id/books for member', async () => {
    const res = await request(app)
      .get(`/api/group/${groupId}/books`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    const ids = res.body.map((b: { id: string }) => b.id);
    expect(ids).toContain(BOOK_ID);
  });

  it('GET /book/:id/sharing returns group_ids array', async () => {
    const res = await request(app)
      .get(`/api/book/${BOOK_ID}/sharing`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.group_ids).toContain(groupId);
  });

  it('sharing a book auto-shares its style and solutionStyle', async () => {
    const styleShare = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM styleshares ss
      JOIN styles s ON s.id = ss.style_id
      WHERE s.client_id = 'style-for-book' AND ss.group_id = ${groupId}
    `;
    expect(Number(styleShare[0].count)).toBeGreaterThan(0);

    const solutionShare = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count FROM styleshares ss
      JOIN styles s ON s.id = ss.style_id
      WHERE s.client_id = 'style-solution' AND ss.group_id = ${groupId}
    `;
    expect(Number(solutionShare[0].count)).toBeGreaterThan(0);
  });

  it('owner can unshare book from group and row is removed from bookshares', async () => {
    await request(app)
      .delete(`/api/group/${groupId}/book/${BOOK_ID}/share`)
      .set('Authorization', `Bearer ${ownerToken}`);

    // API-level check
    const res = await request(app)
      .get(`/api/book/${BOOK_ID}/sharing`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.body.group_ids).not.toContain(groupId);

    // Direct DB check: no bookshares row for this book+group
    const bookRow = await prisma.$queryRaw<{ id: number }[]>`
      SELECT id FROM books WHERE grid_ids::jsonb->>'id' = ${BOOK_ID}
    `;
    const shareCount = await prisma.bookshares.count({
      where: { book_id: bookRow[0].id, group_id: groupId },
    });
    expect(shareCount).toBe(0);
  });

  it('non-owner cannot share another user\'s book', async () => {
    const res = await request(app)
      .post(`/api/group/${groupId}/book/${BOOK_ID}/share`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(404);
  });
});

// ── Font sharing ──────────────────────────────────────────────────────────────

describe('Font sharing', () => {
  const FONT_NAME = 'TestFont';

  beforeAll(async () => {
    await request(app)
      .post('/api/font')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ family: FONT_NAME, content: 'base64data', updated: 0 });
  });

  it('owner can share font to a group', async () => {
    const res = await request(app)
      .post(`/api/group/${groupId}/font/${FONT_NAME}/share`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('shared font appears in GET /group/:id/fonts for member', async () => {
    const res = await request(app)
      .get(`/api/group/${groupId}/fonts`)
      .set('Authorization', `Bearer ${memberToken}`);
    expect(res.status).toBe(200);
    const families = res.body.map((f: { family: string }) => f.family);
    expect(families).toContain(FONT_NAME);
  });

  it('GET /font/:name/sharing returns group_ids array', async () => {
    const res = await request(app)
      .get(`/api/font/${FONT_NAME}/sharing`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.group_ids).toContain(groupId);
  });

  it('owner can unshare font from group and row is removed from fontshares', async () => {
    await request(app)
      .delete(`/api/group/${groupId}/font/${FONT_NAME}/share`)
      .set('Authorization', `Bearer ${ownerToken}`);

    // API-level check
    const res = await request(app)
      .get(`/api/font/${FONT_NAME}/sharing`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.body.group_ids).not.toContain(groupId);

    // Direct DB check: no fontshares row for this font+group
    const fontRow = await prisma.fonts.findFirst({ where: { name: FONT_NAME } });
    const shareCount = await prisma.fontshares.count({
      where: { font_id: fontRow!.id, group_id: groupId },
    });
    expect(shareCount).toBe(0);
  });
});
