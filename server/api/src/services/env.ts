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
  admin: {
    token: process.env.ADMIN_TOKEN || '',
  },
};
export default config;
