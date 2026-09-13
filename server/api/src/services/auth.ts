import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from './env';
import { type users as User } from '@prisma/client';
const JWT_EXPIRES_IN = config.auth.jwtExpiresIn || '1h';
const JWT_REFRESH_EXPIRES_IN = config.auth.refreshTokenExpiresIn || '7d';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, config.auth.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const generateAccessToken = (userId: number): string => {
  return jwt.sign({ userId }, config.auth.jwtSecret, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (userId: number): string => {
  return jwt.sign({ userId }, config.auth.jwtRefreshSecret, {
    expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyRefreshToken = (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.auth.jwtRefreshSecret, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded as User);
    });
  });
};
