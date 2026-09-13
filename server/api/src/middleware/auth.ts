import passport from 'passport';
import { users as User } from '@prisma/client'; // Import User type from Prisma
import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';
// Middleware to protect routes
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization?.split(' ')[1];
  if (!accessToken) {
    res.status(401).json({ error: 'Access token is required' });
    next();
    return;
  }
  // Check if token is blacklisted
  const blacklistedToken = await prisma.tokenblacklist.findFirst({
    where: {
      token: accessToken,
    },
  });
  if (blacklistedToken) {
    res.status(401).json({ error: 'Token is invalid' });
    next();
    return;
  }
  passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user; // Attach user to request object
    next();
  })(req, res, next);
};
