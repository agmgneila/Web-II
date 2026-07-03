import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';

export const listBooks = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const where = {
    ...(req.query.genre && { genre: { equals: req.query.genre, mode: 'insensitive' } }),
    ...(req.query.author && { author: { contains: req.query.author, mode: 'insensitive' } }),
    ...(req.query.available === 'true' && { available: { gt: 0 } }),
    ...(req.query.search && { title: { contains: req.query.search, mode: 'insensitive' } })
  };
  const [data, total] = await prisma.$transaction([
    prisma.book.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { title: 'asc' } }),
    prisma.book.count({ where })
  ]);
  res.json({ data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

export const getBook = async (req, res) => {
  const book = await prisma.book.findUnique({
    where: { id: req.params.id },
    include: { reviews: { include: { user: { select: { id: true, name: true } } } } }
  });
  if (!book) throw AppError.notFound('Libro');
  res.json({ data: book });
};

export const createBook = async (req, res) => {
  const book = await prisma.book.create({ data: { ...req.body, available: req.body.copies } });
  res.status(201).json({ data: book });
};

export const updateBook = async (req, res) => {
  const current = await prisma.book.findUnique({ where: { id: req.params.id } });
  if (!current) throw AppError.notFound('Libro');
  const loaned = current.copies - current.available;
  if (req.body.copies !== undefined && req.body.copies < loaned) {
    throw AppError.badRequest('Las copias no pueden ser menores que los préstamos activos');
  }
  const data = { ...req.body };
  if (data.copies !== undefined) data.available = data.copies - loaned;
  const book = await prisma.book.update({ where: { id: req.params.id }, data });
  res.json({ data: book });
};

export const deleteBook = async (req, res) => {
  const active = await prisma.loan.count({ where: { bookId: req.params.id, status: 'ACTIVE' } });
  if (active) throw AppError.conflict('No se puede borrar un libro prestado');
  await prisma.book.delete({ where: { id: req.params.id } });
  res.json({ message: 'Libro eliminado' });
};
