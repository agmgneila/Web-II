import express from 'express';
import authRoutes from './routes/auth.routes.js';
import booksRoutes from './routes/books.routes.js';
import loansRoutes from './routes/loans.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import prisma from './config/prisma.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();
app.use(express.json({ limit: '100kb' }));
app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: 'ok', database: 'connected' });
});
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
