import { randomUUID } from 'crypto';

const TICKET_TTL_MS = 30_000; // 30 seconds

interface Ticket {
  userId: number;
  expiresAt: number;
}

const tickets = new Map<string, Ticket>();

export function createTicket(userId: number): string {
  const ticket = randomUUID();
  tickets.set(ticket, { userId, expiresAt: Date.now() + TICKET_TTL_MS });
  return ticket;
}

/** Validates and consumes the ticket (one-time use). Returns userId or null. */
export function consumeTicket(ticket: string): number | null {
  const entry = tickets.get(ticket);
  if (!entry) return null;
  tickets.delete(ticket);
  if (Date.now() > entry.expiresAt) return null;
  return entry.userId;
}

// Purge expired tickets every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of tickets) {
    if (now > entry.expiresAt) tickets.delete(key);
  }
}, 60_000);
