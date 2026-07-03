import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = (value) => bcrypt.hash(value, 10);
export const comparePassword = (value, hash) => bcrypt.compare(value, hash);
export const signToken = (user) => jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
);
