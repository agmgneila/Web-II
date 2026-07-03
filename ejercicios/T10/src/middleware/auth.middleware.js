import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const auth = async (req, res, next) => {
  try {
    const [type, token] = (req.headers.authorization || '').split(' ');
    if (type !== 'Bearer' || !token) return res.status(401).json({ message: 'No autorizado' });
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(userId);
    if (!req.user) return res.status(401).json({ message: 'Usuario inexistente' });
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
};

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(userId);
    if (!user) throw new Error();
    socket.user = user;
    next();
  } catch {
    next(new Error('unauthorized'));
  }
};
