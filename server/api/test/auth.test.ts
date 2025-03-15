import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRouter from '../src/routes/auth';
import secureRouter from '../src/routes/secure';
import passport from '../src/config/passport';
import { hashPassword } from '../src/services/auth';
import prisma from '../src/prisma';
import '../src/config/passport';

const app = express();
app.use(express.json());
passport(app);
app.use('/api/auth', authRouter);
app.use('/api/secure', secureRouter);

const testUser = {
  email: 'testuser@example.com',
  password: 'password123',
};

let accessToken = '';
let refreshToken = '';

describe.skip('Authentication Tests', () => {
  beforeAll(async () => {
    const hashedPassword = await hashPassword(testUser.password);
    await prisma.users.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        tier_id: 1,
      },
    });
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'newuser@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should not register a user with an existing email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('User already exists');
  });

  it('should login with correct credentials and return tokens', async () => {
    const res = await request(app).post('/api/auth/login').send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    accessToken = res.body.accessToken; // Store access token for protected route tests
    refreshToken = res.body.refreshToken; // Store refresh token for refresh token tests
  });

  it('should fail to login with incorrect credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testuser@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('should access a protected route with a valid token', async () => {
    const res = await request(app)
      .get('/api/secure/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });

  it('should deny access to a protected route without a token', async () => {
    const res = await request(app).get('/api/secure/profile');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Access token is required');
  });

  it('should refresh the token with a valid refresh token', async () => {
    let res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken; // Update the accessToken with the new token
    res = await request(app)
      .get('/api/secure/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
  });

  it('should logout and invalidate the refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');

    // Try to refresh the token with the invalidated refresh token
    const refreshRes = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });

    expect(refreshRes.status).toBe(403);
    expect(refreshRes.body.error).toBe('Invalid or expired refresh token');

    const profileRes = await request(app)
      .get('/api/secure/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(profileRes.status).toBe(401);
  });
});
