import express from 'express';
import { config } from 'dotenv';
import passport from 'passport';
import path from 'path';
import paymentsRouter from './routes/payments';
import authRouter from './routes/auth';
import secureRouter from './routes/secure';
import helmet from './config/helmet';
// Load .env from parent directory
config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

helmet(app);
app.use(passport.initialize());

app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRouter);
app.use('/api/secure', secureRouter);
app.use('/api/payments', paymentsRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Crosswords API!');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
