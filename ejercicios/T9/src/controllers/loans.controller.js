import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';

export const myLoans = async (req, res) => {
  const data = await prisma.loan.findMany({
    where: { userId: req.user.id },
    include: { book: true },
    orderBy: { loanDate: 'desc' }
  });
  res.json({ data });
};

export const allLoans = async (_req, res) => {
  const data = await prisma.loan.findMany({
    include: { book: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { loanDate: 'desc' }
  });
  res.json({ data });
};

export const createLoan = async (req, res) => {
  const loan = await prisma.$transaction(async (tx) => {
    const active = await tx.loan.count({ where: { userId: req.user.id, status: 'ACTIVE' } });
    if (active >= 3) throw AppError.badRequest('Máximo de 3 préstamos activos');
    const duplicate = await tx.loan.findFirst({
      where: { userId: req.user.id, bookId: req.body.bookId, status: 'ACTIVE' }
    });
    if (duplicate) throw AppError.conflict('Ya tienes este libro prestado');
    const updated = await tx.book.updateMany({
      where: { id: req.body.bookId, available: { gt: 0 } },
      data: { available: { decrement: 1 } }
    });
    if (!updated.count) throw AppError.badRequest('No hay ejemplares disponibles');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    return tx.loan.create({ data: { userId: req.user.id, bookId: req.body.bookId, dueDate } });
  });
  res.status(201).json({ data: loan });
};

export const returnLoan = async (req, res) => {
  const loan = await prisma.loan.findUnique({ where: { id: req.params.id } });
  if (!loan) throw AppError.notFound('Préstamo');
  if (loan.userId !== req.user.id && req.user.role === 'USER') throw AppError.forbidden();
  if (loan.status !== 'ACTIVE') throw AppError.conflict('El préstamo ya fue devuelto');
  const returned = await prisma.$transaction(async (tx) => {
    await tx.book.update({ where: { id: loan.bookId }, data: { available: { increment: 1 } } });
    return tx.loan.update({
      where: { id: loan.id },
      data: { status: 'RETURNED', returnDate: new Date() }
    });
  });
  res.json({ data: returned });
};
