import { config as dotenv } from 'dotenv';
import path from 'path';

// Load local secrets first (.env is gitignored and holds the real DATABASE_URL).
dotenv({ path: path.resolve('..', '.env') });

if (!process.env.JWT_SECRET) {
  dotenv({ path: path.resolve('..', '.env.jwt') });
}
if (!process.env.PORT) {
  dotenv({ path: path.resolve('..', '.env.dev') });
}
if(!process.env.TURNSTILE_SECRET_KEY) {
  dotenv({ path: path.resolve('..', '.env.turnstile') });
}
if (!process.env.SMTP_HOST) {
  dotenv({ path: path.resolve('..', '.env.mail') });
}
const config = {
  port: process.env.PORT || 3000,
  mode: process.env.MODE || 'production',
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'mydatabase',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'defaultsecret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'defaultrefreshsecret',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  environment: process.env.NODE_ENV || 'development',
  turnstile: {
    secretKey: process.env.TURNSTILE_SECRET_KEY || '',
  },
  mail: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  },
  resetPassword: {
    tokenExpiresIn: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN || '30m',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },
  admin: {
    token: process.env.ADMIN_TOKEN || '',
  },
  plausible: {
    apiKey: process.env.PLAUSIBLE_API_KEY || '',
    siteId: process.env.PLAUSIBLE_SITE_ID || 'motsflex.com',
    apiBase: process.env.PLAUSIBLE_API_BASE || 'http://localhost:8000',
  },
};
export default config;
