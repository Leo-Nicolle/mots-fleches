import helmet from 'helmet';
import { type Express } from 'express';
import rateLimit from 'express-rate-limit';

export default function protect(app: Express) {
  // Security: HTTP headers
  app.use(helmet());

  // Security: Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
}
