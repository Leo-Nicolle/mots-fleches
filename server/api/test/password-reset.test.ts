import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import crypto from 'crypto';
import { buildApp, createUser, login } from './helpers';
import prisma from '../src/prisma';

const app = buildApp();

describe('change-password', () => {
  const EMAIL = 'change@password.test';

  it('changes the password and invalidates the old one', async () => {
    await createUser(EMAIL);
    const token = await login(app, EMAIL);

    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'password123', newPassword: 'newpass456' });
    expect(res.status).toBe(200);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: 'password123' });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: 'newpass456' });
    expect(newLogin.status).toBe(200);
  });

  it('rejects an incorrect current password', async () => {
    await createUser('change-wrong@password.test');
    const token = await login(app, 'change-wrong@password.test');
    const res = await request(app)
      .post('/api/auth/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'nope', newPassword: 'whatever' });
    expect(res.status).toBe(401);
  });
});

describe('forgot-password / reset-password', () => {
  const EMAIL = 'reset@password.test';

  beforeAll(async () => {
    await createUser(EMAIL);
  });

  it('forgot-password stores a reset token hash', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: EMAIL });
    expect(res.status).toBe(200);

    const user = await prisma.users.findUnique({ where: { email: EMAIL } });
    expect(user!.reset_token_hash).toBeTruthy();
    expect(user!.reset_token_expires_at!.getTime()).toBeGreaterThan(Date.now());
  });

  it('reset-password updates the password with a valid token', async () => {
    const rawToken = 'raw-reset-token-123';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await prisma.users.update({
      where: { email: EMAIL },
      data: {
        reset_token_hash: tokenHash,
        reset_token_expires_at: new Date(Date.now() + 60_000),
      },
    });

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: rawToken, password: 'resetpass789' });
    expect(res.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, password: 'resetpass789' });
    expect(loginRes.status).toBe(200);
  });

  it('rejects an invalid reset token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'bad-token', password: 'whatever' });
    expect(res.status).toBe(400);
  });
});
