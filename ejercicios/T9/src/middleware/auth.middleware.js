import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';

export const auth = async (req, _res, next) => {
  try {
    const [type, token] = (req.headers.authorization || '').split(' ');
    if (type !== 'Bearer' || !token) throw AppError.unauthorized();
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.unauthorized();
    req.user = user;
    next();
  } catch (error) {
    next(error instanceof AppError ? error : AppError.unauthorized('Token inválido'));
  }
};

export const allowRoles = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) return next(AppError.forbidden());
  next();
};
