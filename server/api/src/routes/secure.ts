import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { users as User } from '@prisma/client';
import { getBillingDetails, getTierName } from '../services/stripe';
import plans from '../plans.json';

const router = Router();

router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  if (!user) return;
  try {
    const billing = user.stripe_id ? await getBillingDetails(user.stripe_id) : null;
    const tier = getTierName(user.tier_id || 1);

    res.status(200).json({
      email: user.email,
      billing,
      tier,
      limits: plans[tier].limits,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
