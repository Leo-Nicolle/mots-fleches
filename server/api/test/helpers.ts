import express from 'express';
import request from 'supertest';
import authRouter from '../src/routes/auth';
import secureRouter from '../src/routes/secure';
import gridRouter from '../src/routes/grid';
import groupsRouter from '../src/routes/groups';
import groupResourcesRouter from '../src/routes/group-resources';
import collabRouter from '../src/routes/collab';
import passport from '../src/config/passport';
import { hashPassword } from '../src/services/auth';
import prisma from '../src/prisma';

export function buildApp() {
  const app = express();
  app.use(express.json());
  passport(app);
  app.use('/api/auth', authRouter);
  app.use('/api', secureRouter);
  app.use('/api/', gridRouter);
  app.use('/api/', groupsRouter);
  app.use('/api/', groupResourcesRouter);
  app.use('/api/', collabRouter);
  return app;
}

export async function createUser(email: string, password = 'password123') {
  await prisma.users.create({
    data: { email, password: await hashPassword(password), tier_id: 1 },
  });
}

export async function login(
  app: express.Express,
  email: string,
  password = 'password123'
): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.accessToken;
}
