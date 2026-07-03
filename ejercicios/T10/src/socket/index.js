import { Server } from 'socket.io';
import User from '../models/user.model.js';
import { socketAuth } from '../middleware/auth.middleware.js';
import { chatHandler } from './handlers/chat.handler.js';
import { roomHandler } from './handlers/room.handler.js';

const roomUsers = new Map();
const presence = {
  join(roomId, socket) {
    if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
    roomUsers.get(roomId).set(socket.id, {
      id: socket.user.id,
      username: socket.user.username
    });
  },
  leave(roomId, socket) {
    roomUsers.get(roomId)?.delete(socket.id);
    if (!roomUsers.get(roomId)?.size) roomUsers.delete(roomId);
  },
  users(roomId) {
    return [...(roomUsers.get(roomId)?.values() || [])];
  }
};

export const configureSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000' }
  });
  io.use(socketAuth);
  io.on('connection', async (socket) => {
    roomHandler(io, socket, presence);
    chatHandler(io, socket);
    await User.updateOne({ _id: socket.user._id }, { online: true });
    io.emit('user:online', { userId: socket.user._id });

    socket.on('disconnect', async () => {
      for (const [roomId, users] of roomUsers) {
        if (users.has(socket.id)) {
          presence.leave(roomId, socket);
          socket.to(roomId).emit('room:user-left', {
            user: { id: socket.user.id, username: socket.user.username },
            users: presence.users(roomId)
          });
        }
      }
      const stillOnline = [...io.sockets.sockets.values()]
        .some((client) => client.user?.id === socket.user.id);
      if (!stillOnline) {
        await User.updateOne({ _id: socket.user._id }, { online: false });
        io.emit('user:offline', { userId: socket.user._id });
      }
    });
  });
  return io;
};
