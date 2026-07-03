import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import authRoutes from './routes/auth.routes.js';
import roomsRoutes from './routes/rooms.routes.js';
import { configureSocket } from './socket/index.js';

const root = dirname(fileURLToPath(import.meta.url));
export const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(express.static(join(root, '../public')));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use((error, _req, res, _next) => {
  if (error?.code === 11000) return res.status(409).json({ message: 'El registro ya existe' });
  console.error(error);
  res.status(500).json({ message: 'Error interno' });
});

export const server = createServer(app);
export const io = configureSocket(server);
