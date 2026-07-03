import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { config } from '../config/index.js';
import User from '../models/User.js';
import { setIo } from '../services/socket.service.js';

export const configureSocket = (server) => {
  const io = new Server(server, { cors: { origin: process.env.CLIENT_URL || '*' } });
  io.use(async (socket, next) => {
    try {
      const { userId } = jwt.verify(socket.handshake.auth?.token, config.accessSecret);
      const user = await User.findOne({ _id: userId, deleted: false });
      if (!user?.company) throw new Error();
      socket.user = user;
      next();
    } catch { next(new Error('unauthorized')); }
  });
  io.on('connection', (socket) => socket.join(String(socket.user.company)));
  setIo(io);
  return io;
};
