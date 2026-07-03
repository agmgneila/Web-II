import { io as createClient } from 'socket.io-client';
import mongoose from 'mongoose';
import { connectDb } from '../src/config/db.js';
import Message from '../src/models/message.model.js';
import Room from '../src/models/room.model.js';
import User from '../src/models/user.model.js';
import { io, server } from '../src/app.js';

await connectDb();
console.log('1/6 MongoDB conectado');
await new Promise((resolve) => server.listen(0, resolve));
console.log('2/6 Servidor iniciado');
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;
const suffix = Date.now();
const email = `socket.${suffix}@example.test`;
let user;
let room;
let client;
const watchdog = setTimeout(() => {
  console.error('La prueba superó 20 segundos');
  process.exit(1);
}, 20_000);

try {
  const registered = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: `socket-${suffix}`, email, password: 'SocketTest123!' })
  }).then((response) => response.json());
  user = await User.findOne({ email });
  console.log('3/6 Usuario registrado');

  room = await fetch(`${base}/api/rooms`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${registered.token}` },
    body: JSON.stringify({ name: `room-${suffix}` })
  }).then((response) => response.json()).then((body) => body.data);
  console.log('4/6 Sala creada');

  client = createClient(base, { auth: { token: registered.token }, transports: ['websocket'] });
  await new Promise((resolve, reject) => {
    client.on('connect', resolve);
    client.on('connect_error', reject);
  });
  console.log('5/6 WebSocket conectado');
  await new Promise((resolve, reject) => {
    client.emit('room:join', { roomId: room._id }, (ack) =>
      ack.success ? resolve() : reject(new Error(ack.message))
    );
  });
  console.log('6/6 Sala unida');
  const received = new Promise((resolve) => client.once('chat:message', resolve));
  client.emit('chat:message', { roomId: room._id, content: 'Mensaje persistente' });
  const message = await received;
  const saved = await Message.findById(message.id);
  if (!saved || saved.content !== 'Mensaje persistente') throw new Error('El mensaje no se persistió');
  console.log('REST, JWT, sala, WebSocket y persistencia verificados');
} finally {
  clearTimeout(watchdog);
  client?.disconnect();
  if (room) await Message.deleteMany({ room: room._id });
  if (room) await Room.deleteOne({ _id: room._id });
  if (user) await User.deleteOne({ _id: user._id });
  await new Promise((resolve) => io.close(resolve));
  await mongoose.disconnect();
}
