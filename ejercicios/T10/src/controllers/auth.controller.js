import User from '../models/user.model.js';
import { comparePassword, hashPassword, signToken } from '../utils/auth.js';

const publicUser = (user) => ({ id: user._id, username: user.username, email: user.email });

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password || password.length < 8) {
    return res.status(400).json({ message: 'Username, email y password (mín. 8) son obligatorios' });
  }
  const exists = await User.exists({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (exists) return res.status(409).json({ message: 'Email o username ya registrado' });
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password: await hashPassword(password)
  });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+password');
  if (!user || !(await comparePassword(req.body.password || '', user.password))) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }
  res.json({ token: signToken(user), user: publicUser(user) });
};

export const me = (req, res) => res.json({ user: publicUser(req.user) });
