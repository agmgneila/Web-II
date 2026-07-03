import { createHash, randomInt } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const verificationCode = () => String(randomInt(100000, 1000000));
export const tokenHash = (token) => createHash('sha256').update(token).digest('hex');
export const accessToken = (user) => jwt.sign(
  { userId: user._id }, config.accessSecret, { expiresIn: config.accessTtl }
);
export const refreshToken = (user) => jwt.sign(
  { userId: user._id, type: 'refresh' }, config.refreshSecret, { expiresIn: config.refreshTtl }
);
export const verifyRefresh = (token) => jwt.verify(token, config.refreshSecret);
