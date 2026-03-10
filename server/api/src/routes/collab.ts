import { Router, Request, Response } from 'express';
import { users as User } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { createTicket } from '../collab/tickets';

const router = Router();

/**
 * POST /api/collab/ticket
 * Exchanges a valid JWT for a short-lived one-time WebSocket ticket.
 */
router.post('/collab/ticket', authMiddleware, (req: Request, res: Response) => {
  const user = req.user as User;
  const ticket = createTicket(user.id);
  res.json({ ticket });
});

export default router;
