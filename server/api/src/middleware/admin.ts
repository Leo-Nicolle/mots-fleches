import { Request, Response, NextFunction } from 'express';
import config from '../services/env';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!config.admin.token) {
    res.status(503).json({ error: 'Admin access not configured' });
    return;
  }
  if (!token || token !== config.admin.token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};
