import prisma from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { checkPassword, hashPassword, signToken } from '../utils/auth.js';

const publicUser = ({ password: _password, ...user }) => user;

export const register = async (req, res) => {
  const exists = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (exists) throw AppError.conflict('El email ya está registrado');
  const user = await prisma.user.create({
    data: { ...req.body, password: await hashPassword(req.body.password) }
  });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
};

export const login = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (!user || !(await checkPassword(req.body.password, user.password))) {
    throw AppError.unauthorized('Credenciales incorrectas');
  }
  res.json({ token: signToken(user), user: publicUser(user) });
};

export const me = (req, res) => res.json({ user: publicUser(req.user) });
