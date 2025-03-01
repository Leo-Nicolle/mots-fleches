import express from 'express';
import config from './services/env';
// import paymentsRouter from './routes/payments';
import authRouter from './routes/auth';
import secureRouter from './routes/secure';
import helmet from './config/helmet';
import passport from './config/passport';
// Load .env from parent directory
const app = express();
const PORT = config.port || 3000;

helmet(app);
passport(app);

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/secure', secureRouter);
// app.use('/api/payments', paymentsRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Crosswords API!');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
