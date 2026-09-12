import { Router, Request, Response } from 'express';
import { users as User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import parseDuration from 'parse-duration';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../services/auth';
import { sendPasswordResetEmail } from '../services/mail';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/auth';
import config from '../services/env';

const router = Router();

const verifyTurnstile = async (turnstileToken: string | undefined): Promise<boolean> => {
  if (!config.turnstile.secretKey) return true;
  if (!turnstileToken) return false;
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: config.turnstile.secretKey, response: turnstileToken }),
  });
  const verifyData = (await verifyRes.json()) as { success: boolean };
  return verifyData.success;
};

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/join', async (req: Request, res: Response) => {
  const { email, password, pseudo, turnstileToken } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }
  if (!(await verifyTurnstile(turnstileToken))) {
    res.status(400).json({ error: 'Captcha verification failed' });
    return;
  }

  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }
  const hashedPassword = await hashPassword(password);

  try {
    const newUser = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        pseudo: pseudo || null,
      },
    });
    res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
  } catch (error) {
    console.error('[register] DB error:', error);
    if ((error as { code?: string }).code === 'email_invalid')
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
      where: { id: (req.user as User).id },
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
  const user = await prisma.users.findUnique({ where: { id: (req.user as User).id } });
  if (!user || !(await verifyPassword(currentPassword, user.password))) {
    res.status(401).json({ error: 'Invalid current password' });
    return;
  }
  const hashed = await hashPassword(newPassword);
  await prisma.users.update({ where: { id: user.id }, data: { password: hashed } });
  res.status(200).json({ message: 'Password updated successfully' });
});

router.post('/forgot-password', forgotPasswordLimiter, async (req: Request, res: Response) => {
  const { email, turnstileToken } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }
  if (!(await verifyTurnstile(turnstileToken))) {
    res.status(400).json({ error: 'Captcha verification failed' });
    return;
  }

  const user = await prisma.users.findUnique({ where: { email } });
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    await prisma.users.update({
      where: { id: user.id },
      data: {
        reset_token_hash: tokenHash,
        reset_token_expires_at: new Date(
          Date.now() + (parseDuration(config.resetPassword.tokenExpiresIn) || 0)
        ),
      },
    });
    const resetUrl = `${config.resetPassword.clientUrl}/passwordreset/${rawToken}`;
    sendPasswordResetEmail(user.email, resetUrl).catch((error) => {
      console.error('[forgot-password] failed to send email:', error);
    });
  }
  // Always respond the same way, whether or not the email exists, to avoid leaking which emails are registered.
  res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
});

router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body;
  if (!token || !password) {
    res.status(400).json({ error: 'Token and new password required' });
    return;
  }
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.users.findFirst({
    where: {
      reset_token_hash: tokenHash,
      reset_token_expires_at: { gt: new Date() },
    },
  });
  if (!user) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }
  const hashed = await hashPassword(password);
  await prisma.users.update({
    where: { id: user.id },
    data: {
      password: hashed,
      reset_token_hash: null,
      reset_token_expires_at: null,
      // Reset also revokes any existing session.
      refresh_token: null,
      refresh_token_expires_at: null,
    },
  });
  res.status(200).json({ message: 'Password reset successfully' });
});

export default router;
