import { describe, it, expect } from 'vitest';
import config from '../src/services/env';

describe('test environment', () => {
  it('runs in test mode, not production', () => {
    expect(config.mode).toBe('test');
    expect(config.environment).toBe('test');
  });

  it('uses test JWT secrets, not production defaults', () => {
    expect(config.auth.jwtSecret).toBe('test_jwt_secret_key');
    expect(config.auth.jwtRefreshSecret).toBe('test_jwt_refresh_secret_key');
  });

  it('does not leak production admin/plausible/mail secrets', () => {
    expect(config.admin.token).toBe('test-admin-token');
    expect(config.plausible.apiKey).toBe('test-plausible-api-key');
    expect(config.plausible.siteId).toBe('test.motsflex.com');
    expect(config.mail.host).toBe('localhost');
    expect(config.mail.user).toBe('test@example.com');
  });

  it('points at the dedicated test database', () => {
    expect(process.env.DATABASE_URL).toContain(':5534/');
    expect(process.env.DATABASE_URL).toContain('crosswords_db');
  });
});
