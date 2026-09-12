import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { buildApp, createUser, login } from './helpers';

const app = buildApp();

let token = '';

describe('styles', () => {
  const EMAIL = 'styles@resources.test';
  beforeAll(async () => {
    await createUser(EMAIL);
    token = await login(app, EMAIL);
  });

  it('creates and reads a style', async () => {
    const create = await request(app)
      .post('/api/style')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: 'style-1', grid: { cellSize: 30 } });
    expect(create.status).toBe(200);
    expect(create.body).toBe('style-1');

    const get = await request(app)
      .get('/api/style/style-1')
      .set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(200);
    expect(get.body.grid.cellSize).toBe(30);

    const list = await request(app)
      .get('/api/styles')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);
  });

  it('updates an existing style instead of duplicating', async () => {
    await request(app)
      .post('/api/style')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: 'style-1', grid: { cellSize: 40 } });

    const get = await request(app)
      .get('/api/style/style-1')
      .set('Authorization', `Bearer ${token}`);
    expect(get.body.grid.cellSize).toBe(40);
  });

  it('returns 404 for an unknown style', async () => {
    const res = await request(app)
      .get('/api/style/nope')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('deletes a style', async () => {
    const del = await request(app)
      .delete('/api/style/style-1')
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);

    const get = await request(app)
      .get('/api/style/style-1')
      .set('Authorization', `Bearer ${token}`);
    expect(get.status).toBe(404);
  });
});

describe('custom words and banned words', () => {
  const EMAIL = 'words@resources.test';
  beforeAll(async () => {
    await createUser(EMAIL);
    token = await login(app, EMAIL);
  });

  it('adds and lists a custom word', async () => {
    const add = await request(app)
      .post('/api/word')
      .set('Authorization', `Bearer ${token}`)
      .send({ word: 'ABRICOT' });
    expect(add.status).toBe(200);
    expect(add.body).toBe('ABRICOT');

    const list = await request(app)
      .get('/api/words')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body).toContain('ABRICOT');
  });

  it('rejects an empty word', async () => {
    const res = await request(app)
      .post('/api/word')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('adds and deletes a banned word', async () => {
    await request(app)
      .post('/api/banned-word')
      .set('Authorization', `Bearer ${token}`)
      .send({ word: 'FORBIDDEN' });

    const list = await request(app)
      .get('/api/banned-words')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body).toContain('FORBIDDEN');

    await request(app)
      .delete('/api/banned-word/FORBIDDEN')
      .set('Authorization', `Bearer ${token}`);

    const after = await request(app)
      .get('/api/banned-words')
      .set('Authorization', `Bearer ${token}`);
    expect(after.body).not.toContain('FORBIDDEN');
  });
});

describe('fonts', () => {
  const EMAIL = 'fonts@resources.test';
  beforeAll(async () => {
    await createUser(EMAIL);
    token = await login(app, EMAIL);
  });

  it('creates, lists and deletes a font', async () => {
    const create = await request(app)
      .post('/api/font')
      .set('Authorization', `Bearer ${token}`)
      .send({ family: 'TestFamily', content: 'base64', updated: 0 });
    expect(create.status).toBe(200);
    expect(create.body).toBe('TestFamily');

    const list = await request(app)
      .get('/api/fonts')
      .set('Authorization', `Bearer ${token}`);
    expect(list.body.map((f: { family: string }) => f.family)).toContain('TestFamily');

    await request(app)
      .delete('/api/font/TestFamily')
      .set('Authorization', `Bearer ${token}`);

    const after = await request(app)
      .get('/api/fonts')
      .set('Authorization', `Bearer ${token}`);
    expect(after.body.map((f: { family: string }) => f.family)).not.toContain('TestFamily');
  });
});
