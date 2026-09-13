import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendMail: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail: mocks.sendMail }),
  },
}));

import { sendPasswordResetEmail } from '../../src/services/mail';

describe('services/mail', () => {
  beforeEach(() => {
    mocks.sendMail.mockReset();
    mocks.sendMail.mockResolvedValue({});
  });

  it('sends a reset email to the user with the reset URL', async () => {
    await sendPasswordResetEmail('user@example.com', 'https://example.com/reset/abc');
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    const mail = mocks.sendMail.mock.calls[0][0] as Record<string, string>;
    expect(mail.to).toBe('user@example.com');
    expect(mail.text).toContain('https://example.com/reset/abc');
  });
});
