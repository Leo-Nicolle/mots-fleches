import { describe, it, expect, vi, afterEach } from 'vitest';
import { createTicket, consumeTicket } from '../../src/collab/tickets';

describe('collab/tickets', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a ticket that can be consumed once', () => {
    const ticket = createTicket(1);
    expect(ticket).toBeTruthy();

    expect(consumeTicket(ticket)).toBe(1);
    // one-time use
    expect(consumeTicket(ticket)).toBeNull();
  });

  it('returns null for an unknown ticket', () => {
    expect(consumeTicket('does-not-exist')).toBeNull();
  });

  it('rejects an expired ticket', () => {
    vi.useFakeTimers();
    const ticket = createTicket(2);
    // advance past the 30s TTL
    vi.advanceTimersByTime(31_000);
    expect(consumeTicket(ticket)).toBeNull();
  });

  it('creates unique tickets', () => {
    expect(createTicket(1)).not.toBe(createTicket(1));
  });
});
