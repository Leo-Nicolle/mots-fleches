import { config as dotenv } from 'dotenv';
import path from 'path';

if (!process.env.JWT_SECRET) {
  dotenv({ path: path.resolve('..', '.env.jwt') });
}
if (!process.env.STRIPE_SECRET_KEY) {
  dotenv({ path: path.resolve('..', '.env.stripe') });
}
if (!process.env.PORT) {
  dotenv({ path: path.resolve('..', '.env') });
}
if(!process.env.TURNSTILE_SECRET_KEY) {
  dotenv({ path: path.resolve('..', '.env.turnstile') });
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
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY!,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
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
};
export default config;
