import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';

export const listReviews = async (req, res) => {
  const data = await prisma.review.findMany({
    where: { bookId: req.params.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ data });
};

export const createReview = async (req, res) => {
  const read = await prisma.loan.findFirst({
    where: { userId: req.user.id, bookId: req.params.id, status: 'RETURNED' }
  });
  if (!read) throw AppError.forbidden('Solo puedes reseñar libros que hayas devuelto');
  const review = await prisma.review.create({
    data: { ...req.body, userId: req.user.id, bookId: req.params.id }
  });
  res.status(201).json({ data: review });
};

export const deleteReview = async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) throw AppError.notFound('Reseña');
  if (review.userId !== req.user.id && req.user.role !== 'ADMIN') throw AppError.forbidden();
  await prisma.review.delete({ where: { id: review.id } });
  res.json({ message: 'Reseña eliminada' });
};
