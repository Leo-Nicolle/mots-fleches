import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/profile', authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'This is a protected profile route!',
    user: req.user,
  });
});

router.get('/settings', authMiddleware, (req: Request, res: Response) => {
  res.json({
    message: 'User settings',
    user: req.user,
  });
});

export default router;
