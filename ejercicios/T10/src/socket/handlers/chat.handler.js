import Message from '../../models/message.model.js';
import Room from '../../models/room.model.js';

export const chatHandler = (io, socket) => {
  socket.on('chat:message', async ({ roomId, content } = {}, ack = () => {}) => {
    if (!socket.rooms.has(roomId) || !content?.trim()) {
      return ack({ success: false, message: 'Sala o mensaje inválido' });
    }
    const room = await Room.exists({ _id: roomId });
    if (!room) return ack({ success: false, message: 'Sala no encontrada' });
    const saved = await Message.create({ room: roomId, user: socket.user._id, content });
    const message = {
      id: saved._id,
      roomId,
      user: { id: socket.user._id, username: socket.user.username },
      content: saved.content,
      timestamp: saved.createdAt
    };
    io.to(roomId).emit('chat:message', message);
    ack({ success: true, messageId: saved._id });
  });

  socket.on('chat:typing', ({ roomId, typing = true } = {}) => {
    if (socket.rooms.has(roomId)) {
      socket.to(roomId).emit('chat:typing', {
        user: { id: socket.user._id, username: socket.user.username },
        typing
      });
    }
  });
};
