import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { buildApp, createUser, login } from './helpers';

const app = buildApp();

const EMAIL = 'profile@secure.test';
let token = '';

describe('secure routes', () => {
  beforeAll(async () => {
    await createUser(EMAIL);
    token = await login(app, EMAIL);
  });

  it('GET /me returns id, email, pseudo', async () => {
    const res = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(EMAIL);
    expect(res.body.id).toBeDefined();
  });

  it('GET /profile returns email, tier and limits', async () => {
    const res = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(EMAIL);
    expect(res.body.tier).toBe('free');
    expect(res.body.limits).toBeDefined();
  });

  it('PUT /profile/pseudo updates and returns the pseudo', async () => {
    const res = await request(app)
      .put('/api/profile/pseudo')
      .set('Authorization', `Bearer ${token}`)
      .send({ pseudo: 'pseudo-test' });
    expect(res.status).toBe(200);
    expect(res.body.pseudo).toBe('pseudo-test');

    const me = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`);
    expect(me.body.pseudo).toBe('pseudo-test');
  });

  it('requires authentication', async () => {
    expect((await request(app).get('/api/me')).status).toBe(401);
    expect((await request(app).get('/api/profile')).status).toBe(401);
  });
});
