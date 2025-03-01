import { config as dotenv } from 'dotenv';
import path from 'path';

if (!process.env.JWT_SECRET) {
  dotenv({ path: path.resolve(__dirname, '..', '.env.jwt') });
}
if (!process.env.STRIPE_SECRET_KEY) {
  dotenv({ path: path.resolve(__dirname, '..', '.env.stripe') });
}
if (!process.env.PORT) {
  dotenv({ path: path.resolve(__dirname, '..', '.env') });
}
const config = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'mydatabase',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET!,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'defaultsecret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
  environment: process.env.NODE_ENV || 'development',
};
export default config;
