import http from 'http';
import express, { Router } from 'express';
import cors from 'cors';
import config from './services/env';
import authRouter from './routes/auth';
import secureRouter from './routes/secure';
import gridRouter from './routes/grid';
import groupsRouter from './routes/groups';
import groupResourcesRouter from './routes/group-resources';
import collabRouter from './routes/collab';
import helmet from './config/helmet';
import passport from './config/passport';
import { setupCollab } from './collab';

// Admin routes live in a private repo and are injected at deploy time.
// They are optional here so the public repo still builds without them.
let adminRouter: Router | undefined;
let plausibleRouter: Router | undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional module, must not fail statically if absent
  adminRouter = require('./routes/admin').default;
} catch {
  console.warn('[api] admin routes not found, /api/admin disabled');
}
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- optional module, must not fail statically if absent
  plausibleRouter = require('./routes/plausible').default;
} catch {
  console.warn('[api] plausible routes not found, /api/admin/plausible disabled');
}

const app = express();
const PORT = config.port || 3000;

helmet(app);
passport(app);
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api', secureRouter);
app.use('/api/', gridRouter);
app.use('/api/', groupsRouter);
app.use('/api/', groupResourcesRouter);
app.use('/api/', collabRouter);
if (adminRouter) app.use('/api/admin', adminRouter);
if (plausibleRouter) app.use('/api/admin/plausible', plausibleRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Crosswords API!');
});

const server = http.createServer(app);
setupCollab(server);

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
