import Room from '../../models/room.model.js';

export const roomHandler = (io, socket, presence) => {
  socket.on('room:join', async ({ roomId } = {}, ack = () => {}) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) return ack({ success: false, message: 'Sala no encontrada' });
      for (const joined of socket.rooms) if (joined !== socket.id) socket.leave(joined);
      await socket.join(roomId);
      presence.join(roomId, socket);
      const users = presence.users(roomId);
      socket.emit('room:joined', { room: room.toJSON(), users });
      socket.to(roomId).emit('room:user-joined', {
        user: { id: socket.user.id, username: socket.user.username },
        users
      });
      ack({ success: true });
    } catch (error) {
      ack({ success: false, message: error.message });
    }
  });

  socket.on('room:leave', ({ roomId } = {}) => {
    socket.leave(roomId);
    presence.leave(roomId, socket);
    socket.to(roomId).emit('room:user-left', {
      user: { id: socket.user.id, username: socket.user.username },
      users: presence.users(roomId)
    });
  });
};
