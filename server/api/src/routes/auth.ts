import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import parseDuration from 'parse-duration';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../services/auth';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/auth';
import config from '../services/env';
import { createCustommer, getCustommer } from '../services/stripe';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }
  // create stripe account for the user
  try {
    const customer =
      (await getCustommer(email)) || (await createCustommer(email));
    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        stripe_id: customer.id,
      },
    });

    res
      .status(201)
      .json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.log('error', error);
    if (error.core === 'email_invalid')
      res.status(400).json({ error: 'Invalid email' });
    else res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.users.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const accessToken = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);
  // update user
  await prisma.users.update({
    where: { id: user.id },
    data: {
      refresh_token: refreshToken,
      refresh_token_expires_at: new Date(
        Date.now() + (parseDuration(config.auth.refreshTokenExpiresIn) || 0)
      ),
    },
  });
  return res.status(200).json({
    accessToken,
    refreshToken,
  });
});

router.post('/refresh-token', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401).json({ error: 'Refresh token is required' });
    return;
  }
  try {
    await verifyRefreshToken(refreshToken);
    // Issue new tokens
    const user = await prisma.users.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const newAccessToken = generateToken(user.id);
    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});

router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  if (!accessToken) {
    res.status(400).json({ error: 'Access token is required' });
    return;
  }
  const decoded = jwt.decode(accessToken) as any;
  const expiresAt = new Date(decoded.exp * 1000); // JWT exp is in seconds
  // Save access token to blacklist
  try {
    await prisma.tokenblacklist.create({
      data: {
        token: accessToken,
        expires_at: expiresAt,
      },
    });
    // Invalidate refresh token
    await prisma.users.update({
      where: { id: req.user!.id! },
      data: {
        refresh_token: null,
        refresh_token_expires_at: null,
      },
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});

router.post('/change-password', authMiddleware, async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new password required' });
    return;
  }
  const user = await prisma.users.findUnique({ where: { id: req.user!.id } });
  if (!user || !(await verifyPassword(currentPassword, user.password))) {
    res.status(401).json({ error: 'Invalid current password' });
    return;
  }
  const hashed = await hashPassword(newPassword);
  await prisma.users.update({ where: { id: user.id }, data: { password: hashed } });
  res.status(200).json({ message: 'Password updated successfully' });
});

export default router;
