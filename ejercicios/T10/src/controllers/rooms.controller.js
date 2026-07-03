import Message from '../models/message.model.js';
import Room from '../models/room.model.js';

export const listRooms = async (_req, res) => {
  const data = await Room.find().populate('createdBy', 'username').sort({ name: 1 });
  res.json({ data });
};

export const createRoom = async (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ message: 'El nombre es obligatorio' });
  const room = await Room.create({
    name: req.body.name,
    description: req.body.description,
    createdBy: req.user._id
  });
  res.status(201).json({ data: room });
};

export const history = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Sala no encontrada' });
  const data = await Message.find({ room: room._id })
    .populate('user', 'username')
    .sort({ createdAt: -1 })
    .limit(50)
    .then((items) => items.reverse());
  res.json({ data });
};
