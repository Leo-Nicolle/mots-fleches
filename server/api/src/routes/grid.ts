import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { users as User } from '@prisma/client';

import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/grids', authMiddleware, async (req: Request, res: Response) => {
  const user = req.user as User;
  if (!user) {
    return;
  }
  const grids = await prisma.crosswords.findMany({
    where: { user_id: user.id },
  });

  res.json(grids);
});

export default router;
