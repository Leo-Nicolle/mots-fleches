import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { users as User } from '@prisma/client';
import { getBillingDetails, getTierName } from '../services/stripe';
import plans from '../plans.json';

const router = Router();

router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  if (!user) return;
  const billing = await getBillingDetails(user.stripe_id!);
  const tier = getTierName(user.tier_id || 1);

  res.status(200).json({
    email: user.email,
    billing,
    tier,
    limits: plans[tier].limits,
  });
});

export default router;
