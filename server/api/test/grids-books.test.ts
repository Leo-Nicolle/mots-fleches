import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { buildApp, createUser, login } from './helpers';

const app = buildApp();

const EMAIL = 'owner@gridbooks.test';
let token = '';

describe('grids and books CRUD', () => {
  beforeAll(async () => {
    await createUser(EMAIL);
    token = await login(app, EMAIL);
  });

  it('creates, lists, reads and deletes a grid', async () => {
    const grid = { id: 'crud-grid-1', rows: 3, cols: 3, cells: [] };
    const create = await request(app)
      .post('/api/grid')
      .set('Authorization', `Bearer ${token}`)
      .send(grid);
    expect(create.status).toBe(200);

    const list = await request(app)
      .get('/api/grids')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.map((g: { id: string }) => g.id)).toContain('crud-grid-1');

    const get = await request(app)
      .get('/api/grid/crud-grid-1')
      .set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(200);
    expect(get.body.id).toBe('crud-grid-1');

    await request(app)
      .delete('/api/grid/crud-grid-1')
      .set('Authorization', `Bearer ${token}`);

    const after = await request(app)
      .get('/api/grid/crud-grid-1')
      .set('Authorization', `Bearer ${token}`);
    expect(after.status).toBe(404);
  });

  it('creates a book and reports ownership', async () => {
    const create = await request(app)
      .post('/api/book')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: 'crud-book-1', title: 'Crud Book', grids: [] });
    expect(create.status).toBe(200);

    const ownership = await request(app)
      .get('/api/book/crud-book-1/ownership')
      .set('Authorization', `Bearer ${token}`);
    expect(ownership.status).toBe(200);
    expect(ownership.body.owned).toBe(true);
    expect(ownership.body.group_ids).toEqual([]);

    const list = await request(app)
      .get('/api/books')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.length).toBeGreaterThan(0);
  });
});
