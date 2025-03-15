import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/profile', authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({
    message: 'This is a protected profile route!',
  });
});

router.get('/settings', authMiddleware, (req: Request, res: Response) => {
  res.status(200).json({
    message: 'User settings',
    user: req.user,
  });
});

export default router;
