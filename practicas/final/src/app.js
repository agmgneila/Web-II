import { join } from 'node:path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger.js';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { sanitize } from './middleware/sanitize.js';
import userRoutes from './routes/user.routes.js';
import clientRoutes from './routes/client.routes.js';
import projectRoutes from './routes/project.routes.js';
import deliverynoteRoutes from './routes/deliverynote.routes.js';

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || false }));
app.use(rateLimit({ windowMs: 60_000, limit: 100 }));
app.use(express.json({ limit: '100kb' }));
app.use(sanitize);
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/user', userRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/deliverynote', deliverynoteRoutes);
app.get('/health', (_req, res) => res.json({
  status: 'ok',
  db: ['connected', 'connecting'].includes(
    ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
  ) ? 'connected' : 'disconnected',
  uptime: process.uptime(),
  timestamp: new Date().toISOString()
}));
app.use(notFound);
app.use(errorHandler);
export default app;
