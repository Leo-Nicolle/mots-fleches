import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import './config/passport';

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
