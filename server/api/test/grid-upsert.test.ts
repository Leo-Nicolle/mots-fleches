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

const OWNER = { email: 'owner@upsert.test', password: 'password123' };
const MEMBER = { email: 'member@upsert.test', password: 'password123' };
const THIRD = { email: 'third@upsert.test', password: 'password123' };

let ownerToken = '';
let memberToken = '';
let thirdToken = '';
let groupId = 0;

const GRID_ID = 'grid-upsert-test-1';
const BOOK_ID = 'book-upsert-test-1';

async function login(email: string, password: string): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.accessToken;
}

async function gridRowCount(clientId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM crosswords WHERE content::jsonb->>'id' = ${clientId}
  `;
  return Number(rows[0].count);
}

async function bookRowCount(clientId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM books WHERE grid_ids::jsonb->>'id' = ${clientId}
  `;
  return Number(rows[0].count);
}

beforeAll(async () => {
  const hash = await hashPassword(OWNER.password);
  await prisma.users.createMany({
    data: [
      { email: OWNER.email, password: hash, tier_id: 1 },
      { email: MEMBER.email, password: hash, tier_id: 1 },
      { email: THIRD.email, password: hash, tier_id: 1 },
    ],
    skipDuplicates: true,
  });

  [ownerToken, memberToken, thirdToken] = await Promise.all([
    login(OWNER.email, OWNER.password),
    login(MEMBER.email, MEMBER.password),
    login(THIRD.email, THIRD.password),
  ]);

  // Owner creates group and adds member
  const g = await request(app)
    .post('/api/group')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ name: 'UpsertGroup' });
  groupId = g.body.id;

  await request(app)
    .post(`/api/group/${groupId}/member`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ email: MEMBER.email });

  // Owner creates and shares a grid
  await request(app)
    .post('/api/grid')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ id: GRID_ID, cells: ['v1'] });

  await request(app)
    .post(`/api/group/${groupId}/grid/${GRID_ID}/share`)
    .set('Authorization', `Bearer ${ownerToken}`);

  // Owner creates and shares a book
  await request(app)
    .post('/api/book')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({ id: BOOK_ID, title: 'Upsert Book', grids: ['v1'] });

  await request(app)
    .post(`/api/group/${groupId}/book/${BOOK_ID}/share`)
    .set('Authorization', `Bearer ${ownerToken}`);
});

// ── Grid upsert ───────────────────────────────────────────────────────────────

describe('POST /grid upsert logic', () => {
  it('owner updating own grid: exactly one row, content updated', async () => {
    const res = await request(app)
      .post('/api/grid')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ id: GRID_ID, cells: ['v2'] });
    expect(res.status).toBe(200);
    expect(await gridRowCount(GRID_ID)).toBe(1);

    const row = await prisma.$queryRaw<{ content: string }[]>`
      SELECT content FROM crosswords WHERE content::jsonb->>'id' = ${GRID_ID}
    `;
    const parsed = JSON.parse(row[0].content);
    expect(parsed.cells).toEqual(['v2']);
  });

  it('group member updating shared grid: still one row, user_id unchanged', async () => {
    const res = await request(app)
      .post('/api/grid')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ id: GRID_ID, cells: ['v3'] });
    expect(res.status).toBe(200);
    expect(await gridRowCount(GRID_ID)).toBe(1);

    const row = await prisma.$queryRaw<{ content: string; user_id: number }[]>`
      SELECT content, user_id FROM crosswords WHERE content::jsonb->>'id' = ${GRID_ID}
    `;
    const parsed = JSON.parse(row[0].content);
    expect(parsed.cells).toEqual(['v3']);

    const owner = await prisma.users.findUnique({ where: { email: OWNER.email } });
    expect(row[0].user_id).toBe(owner!.id);
  });

  it('unrelated user saving same client_id creates their own separate row', async () => {
    await request(app)
      .post('/api/grid')
      .set('Authorization', `Bearer ${thirdToken}`)
      .send({ id: GRID_ID, cells: ['third-copy'] });

    expect(await gridRowCount(GRID_ID)).toBe(2);
  });

  it('owner saving the same grid twice is idempotent (still one owned row)', async () => {
    const NEW_ID = 'grid-upsert-idempotent';
    await request(app)
      .post('/api/grid')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ id: NEW_ID, cells: ['a'] });
    await request(app)
      .post('/api/grid')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ id: NEW_ID, cells: ['b'] });

    expect(await gridRowCount(NEW_ID)).toBe(1);
    const row = await prisma.$queryRaw<{ content: string }[]>`
      SELECT content FROM crosswords WHERE content::jsonb->>'id' = ${NEW_ID}
    `;
    expect(JSON.parse(row[0].content).cells).toEqual(['b']);
  });
});

// ── Book upsert ───────────────────────────────────────────────────────────────

describe('POST /book upsert logic', () => {
  it('owner updating own book: exactly one row, content updated', async () => {
    const res = await request(app)
      .post('/api/book')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ id: BOOK_ID, title: 'Updated Book', grids: ['v2'] });
    expect(res.status).toBe(200);
    expect(await bookRowCount(BOOK_ID)).toBe(1);

    const row = await prisma.$queryRaw<{ grid_ids: string }[]>`
      SELECT grid_ids::text FROM books WHERE grid_ids::jsonb->>'id' = ${BOOK_ID}
    `;
    const parsed = JSON.parse(row[0].grid_ids);
    expect(parsed.title).toBe('Updated Book');
  });

  it('group member updating shared book: still one row, user_id unchanged', async () => {
    const res = await request(app)
      .post('/api/book')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ id: BOOK_ID, title: 'Member Edit', grids: ['v3'] });
    expect(res.status).toBe(200);
    expect(await bookRowCount(BOOK_ID)).toBe(1);

    const row = await prisma.$queryRaw<{ grid_ids: string; user_id: number }[]>`
      SELECT grid_ids::text, user_id FROM books WHERE grid_ids::jsonb->>'id' = ${BOOK_ID}
    `;
    const parsed = JSON.parse(row[0].grid_ids);
    expect(parsed.title).toBe('Member Edit');

    const owner = await prisma.users.findUnique({ where: { email: OWNER.email } });
    expect(row[0].user_id).toBe(owner!.id);
  });

  it('unrelated user saving same book client_id creates their own separate row', async () => {
    await request(app)
      .post('/api/book')
      .set('Authorization', `Bearer ${thirdToken}`)
      .send({ id: BOOK_ID, title: 'Third Copy', grids: [] });

    expect(await bookRowCount(BOOK_ID)).toBe(2);
  });
});
