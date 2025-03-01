import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from './env';
const JWT_EXPIRES_IN = config.auth.jwtExpiresIn || '1h';

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
    expiresIn: JWT_EXPIRES_IN,
  });
};
