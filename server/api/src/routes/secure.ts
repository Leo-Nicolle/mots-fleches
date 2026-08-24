import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { users as User } from '@prisma/client';
import plans from '../plans.json';
import prisma from '../prisma';

const getTierName = (tierId: number) => {
  return tierId === 1 ? 'free' : tierId === 2 ? 'standard' : 'premium';
};

const router = Router();

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const user = req.user as User;
  res.json({ id: user.id, email: user.email, pseudo: user.pseudo });
});

router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  if (!user) return;
  try {
    const tier = getTierName(user.tier_id || 1);

    res.status(200).json({
      email: user.email,
      pseudo: user.pseudo,
      tier,
      limits: plans[tier].limits,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile/pseudo', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  const { pseudo } = req.body;
  await prisma.users.update({ where: { id: user.id }, data: { pseudo: pseudo || null } });
  res.status(200).json({ pseudo: pseudo || null });
});

export default router;
