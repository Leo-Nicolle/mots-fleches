import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
// import passport from 'passport';
import dotenv from 'dotenv';
import authRouter from '../src/routes/auth';
import secureRouter from '../src/routes/secure';
import passport from '../src/config/passport';
import { hashPassword } from '../src/services/auth';
import prisma from '../src/prisma'; // This will use the mock
import '../src/config/passport';

dotenv.config();

const app = express();
app.use(express.json());
// app.use(passport.initialize());
passport(app);
app.use('/api/auth', authRouter);
app.use('/api/secure', secureRouter);

const testUser = {
  email: 'testuser@example.com',
  password: 'password123',
};

let jwtToken = '';

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Create a test user in the mock database
    const hashedPassword = await hashPassword(testUser.password);
    await prisma.users.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
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

  it('should login with correct credentials and return a token', async () => {
    const res = await request(app).post('/api/auth/login').send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    jwtToken = res.body.token; // Store token for protected route tests
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
      .set('Authorization', `bearer ${jwtToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should deny access to a protected route without a token', async () => {
    const res = await request(app).get('/api/secure/profile');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });
});
