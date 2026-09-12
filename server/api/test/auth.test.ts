import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';

import authRouter from '../src/routes/auth';
import secureRouter from '../src/routes/secure';
import passport from '../src/config/passport';
import { hashPassword } from '../src/services/auth';
import prisma from '../src/prisma';

const app = express();
app.use(express.json());
passport(app);
app.use('/api/auth', authRouter);
app.use('/api/secure', secureRouter);

const PASSWORD = 'password123';

async function createUser(email: string) {
  await prisma.users.create({
    data: { email, password: await hashPassword(PASSWORD), tier_id: 1 },
  });
}

async function login(email: string, password = PASSWORD) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res;
}

describe('Authentication', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/join').send({
      email: 'register@auth.test',
      password: PASSWORD,
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('rejects registration without email/password', async () => {
    const res = await request(app).post('/api/auth/join').send({});
    expect(res.status).toBe(400);
  });

  it('does not register an existing email', async () => {
    await createUser('dup@auth.test');
    const res = await request(app).post('/api/auth/join').send({
      email: 'dup@auth.test',
      password: PASSWORD,
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('User already exists');
  });

  it('logs in with correct credentials and returns tokens', async () => {
    await createUser('login@auth.test');
    const res = await login('login@auth.test');
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('rejects login with a wrong password', async () => {
    await createUser('wrongpass@auth.test');
    const res = await login('wrongpass@auth.test', 'nope');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('rejects login for an unknown email', async () => {
    const res = await login('ghost@auth.test');
    expect(res.status).toBe(401);
  });

  it('grants access to a protected route with a valid token', async () => {
    await createUser('protected@auth.test');
    const loginRes = await login('protected@auth.test');
    const res = await request(app)
      .get('/api/secure/profile')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('protected@auth.test');
  });

  it('denies a protected route without a token', async () => {
    const res = await request(app).get('/api/secure/profile');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Access token is required');
  });

  it('refreshes the access token with a valid refresh token', async () => {
    await createUser('refresh@auth.test');
    const loginRes = await login('refresh@auth.test');
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: loginRes.body.refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();

    const profile = await request(app)
      .get('/api/secure/profile')
      .set('Authorization', `Bearer ${res.body.accessToken}`);
    expect(profile.status).toBe(200);
  });

  it('rejects refresh without a token', async () => {
    const res = await request(app).post('/api/auth/refresh-token').send({});
    expect(res.status).toBe(401);
  });

  it('rejects refresh with an invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: 'not-a-token' });
    expect(res.status).toBe(403);
  });

  it('logout invalidates the refresh token and blacklists the access token', async () => {
    await createUser('logout@auth.test');
    const loginRes = await login('logout@auth.test');

    const logout = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .send();
    expect(logout.status).toBe(200);

    const refresh = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: loginRes.body.refreshToken });
    expect(refresh.status).toBe(403);

    const profile = await request(app)
      .get('/api/secure/profile')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
    expect(profile.status).toBe(401);
  });
});
