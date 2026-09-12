import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../src/services/auth';

describe('services/auth', () => {
  it('hashes a password and verifies it', async () => {
    const hash = await hashPassword('secret');
    expect(hash).not.toBe('secret');
    await expect(verifyPassword('secret', hash)).resolves.toBe(true);
    await expect(verifyPassword('wrong', hash)).resolves.toBe(false);
  });

  it('hashes are salted (unique per call)', async () => {
    const a = await hashPassword('secret');
    const b = await hashPassword('secret');
    expect(a).not.toBe(b);
  });

  it('generateToken / generateAccessToken sign the userId', () => {
    const token = generateToken(42);
    const decoded = jwt.decode(token) as { userId: number };
    expect(decoded.userId).toBe(42);

    const access = generateAccessToken(7);
    expect((jwt.decode(access) as { userId: number }).userId).toBe(7);
  });

  it('generateRefreshToken round-trips through verifyRefreshToken', async () => {
    const token = generateRefreshToken(99);
    const decoded = (await verifyRefreshToken(token)) as { userId: number };
    expect(decoded.userId).toBe(99);
  });

  it('verifyRefreshToken rejects an invalid token', async () => {
    await expect(verifyRefreshToken('garbage')).rejects.toBeTruthy();
  });
});
