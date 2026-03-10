import http from 'http';
import express from 'express';
import cors from 'cors';
import config from './services/env';
import paymentsRouter from './routes/payments';
import webhookRouter from './routes/webhook';
import authRouter from './routes/auth';
import secureRouter from './routes/secure';
import gridRouter from './routes/grid';
import groupsRouter from './routes/groups';
import groupResourcesRouter from './routes/group-resources';
import collabRouter from './routes/collab';
import helmet from './config/helmet';
import passport from './config/passport';
import { setupCollab } from './collab';

const app = express();
const PORT = config.port || 3000;

// helmet(app);
passport(app);
if (config.mode === 'development') {
  app.use(cors());
}

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use('/api', webhookRouter);
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api', secureRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/', gridRouter);
app.use('/api/', groupsRouter);
app.use('/api/', groupResourcesRouter);
app.use('/api/', collabRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Crosswords API!');
});

const server = http.createServer(app);
setupCollab(server);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
