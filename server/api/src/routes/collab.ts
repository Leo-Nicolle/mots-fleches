import { Router, Request, Response } from 'express';
import { users as User } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { createTicket } from '../collab/tickets';

const router = Router();

/**
 * POST /api/collab/ticket
 * Exchanges a valid JWT for a short-lived one-time WebSocket ticket.
 * Also returns the user's display name (pseudo, falling back to email)
 * so the client can set it in Yjs awareness state.
 */
router.post('/collab/ticket', authMiddleware, (req: Request, res: Response) => {
  const user = req.user as User;
  const ticket = createTicket(user.id);
  console.log(`Created ticket ${ticket} for user ${user.pseudo ?? user.email}`);
  res.json({ ticket, name: user.pseudo ?? user.email });
});

export default router;
