import passport from 'passport';
import { users as User } from '@prisma/client'; // Import User type from Prisma
import { Request, Response, NextFunction } from 'express';
// Middleware to protect routes
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate('jwt', { session: false }, (err: Error, user: User) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = user; // Attach user to request object
    next();
  })(req, res, next);
};
