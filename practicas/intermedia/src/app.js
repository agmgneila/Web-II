import { join } from 'node:path';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { sanitize } from './middleware/sanitize.js';
import userRoutes from './routes/user.routes.js';

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(rateLimit({ windowMs: 60_000, limit: 100 }));
app.use(express.json({ limit: '100kb' }));
app.use(sanitize);
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
app.use('/api/user', userRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use(notFound);
app.use(errorHandler);
export default app;
