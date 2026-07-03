import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import Company from '../models/Company.js';
import User from '../models/User.js';
import { notifications } from '../services/notification.service.js';
import { sendVerification } from '../services/mail.service.js';
import {
  accessToken, refreshToken, tokenHash, verificationCode, verifyRefresh
} from '../services/token.service.js';
import AppError from '../utils/AppError.js';

const issueTokens = async (user) => {
  const access = accessToken(user);
  const refresh = refreshToken(user);
  user.refreshTokens.push(tokenHash(refresh));
  await user.save();
  return { accessToken: access, refreshToken: refresh };
};

export const register = async (req, res) => {
  if (await User.exists({ email: req.body.email, deleted: false })) {
    throw AppError.conflict('El email ya está registrado');
  }
  const user = await User.create({
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
    verificationCode: verificationCode(),
    verificationAttempts: 3
  });
  const tokens = await issueTokens(user);
  await sendVerification(user.email, user.verificationCode);
  notifications.emit('user:registered', { userId: user.id, email: user.email });
  res.status(201).json({
    user: { email: user.email, status: user.status, role: user.role },
    ...tokens,
    ...(process.env.NODE_ENV === 'development' && { verificationCode: user.verificationCode })
  });
};

export const validateEmail = async (req, res) => {
  const user = await User.findById(req.user._id).select('+verificationCode +verificationAttempts');
  if (user.status === 'verified') return res.json({ acknowledged: true });
  if (user.verificationAttempts <= 0) throw new AppError(429, 'Intentos agotados');
  if (user.verificationCode !== req.body.code) {
    user.verificationAttempts -= 1;
    await user.save();
    if (!user.verificationAttempts) throw new AppError(429, 'Intentos agotados');
    throw AppError.badRequest(`Código incorrecto. Quedan ${user.verificationAttempts} intentos`);
  }
  user.status = 'verified';
  user.verificationCode = undefined;
  await user.save();
  notifications.emit('user:verified', { userId: user.id });
  res.json({ acknowledged: true });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email, deleted: false })
    .select('+password +refreshTokens');
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw AppError.unauthorized('Credenciales incorrectas');
  }
  res.json({ user: user.toJSON(), ...(await issueTokens(user)) });
};

export const updatePersonal = async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json({ user: req.user });
};

export const onboardCompany = async (req, res) => {
  if (req.user.company) throw AppError.conflict('El usuario ya tiene compañía');
  let data = req.body;
  if (data.isFreelance) {
    if (!req.user.nif || !req.user.name) throw AppError.badRequest('Completa antes los datos personales');
    data = {
      isFreelance: true,
      name: req.user.fullName || req.user.name,
      cif: req.user.nif,
      address: req.user.address
    };
  }
  let company = await Company.findOne({ cif: data.cif, deleted: false });
  if (company) {
    req.user.role = 'guest';
  } else {
    company = await Company.create({ ...data, owner: req.user._id });
    req.user.role = 'admin';
  }
  req.user.company = company._id;
  await req.user.save();
  res.json({ user: req.user, company });
};

export const uploadLogo = async (req, res) => {
  if (!req.file) throw AppError.badRequest('Se requiere una imagen válida');
  const company = await Company.findById(req.user.company);
  if (!company) throw AppError.badRequest('Completa el onboarding de compañía');
  if (company.logo?.startsWith('/uploads/')) {
    await unlink(join(process.cwd(), company.logo)).catch(() => {});
  }
  company.logo = `/uploads/${req.file.filename}`;
  await company.save();
  res.json({ logo: company.logo });
};

export const getUser = async (req, res) => {
  const user = await User.findById(req.user._id).populate('company');
  res.json({ user });
};

export const refresh = async (req, res) => {
  let payload;
  try { payload = verifyRefresh(req.body.refreshToken); } catch { throw AppError.unauthorized('Refresh token inválido'); }
  const user = await User.findById(payload.userId).select('+refreshTokens');
  const hash = tokenHash(req.body.refreshToken);
  if (!user || !user.refreshTokens.includes(hash)) throw AppError.unauthorized('Refresh token revocado');
  user.refreshTokens = user.refreshTokens.filter((item) => item !== hash);
  res.json(await issueTokens(user));
};

export const logout = async (req, res) => {
  const user = await User.findById(req.user._id).select('+refreshTokens');
  if (req.body.refreshToken) {
    const hash = tokenHash(req.body.refreshToken);
    user.refreshTokens = user.refreshTokens.filter((item) => item !== hash);
  } else user.refreshTokens = [];
  await user.save();
  res.json({ acknowledged: true });
};

export const removeUser = async (req, res) => {
  const soft = req.validatedQuery?.soft ?? 'true';
  if (soft === 'false') await User.deleteOne({ _id: req.user._id });
  else {
    req.user.deleted = true;
    await req.user.save();
  }
  notifications.emit('user:deleted', { userId: req.user.id, soft: soft !== 'false' });
  res.json({ acknowledged: true });
};

export const changePassword = async (req, res) => {
  const user = await User.findById(req.user._id).select('+password +refreshTokens');
  if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
    throw AppError.unauthorized('Contraseña actual incorrecta');
  }
  user.password = await bcrypt.hash(req.body.newPassword, 10);
  user.refreshTokens = [];
  await user.save();
  res.json({ acknowledged: true });
};

export const invite = async (req, res) => {
  if (!req.user.company) throw AppError.badRequest('No tienes compañía');
  if (await User.exists({ email: req.body.email })) throw AppError.conflict('El email ya está registrado');
  const user = await User.create({
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10),
    role: 'guest',
    company: req.user.company,
    verificationCode: verificationCode()
  });
  notifications.emit('user:invited', { userId: user.id, companyId: req.user.company });
  res.status(201).json({ user });
};
