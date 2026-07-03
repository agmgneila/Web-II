import Client from '../models/Client.js';
import { emitCompany } from '../services/socket.service.js';
import AppError from '../utils/AppError.js';
import { paged, pagination } from '../utils/pagination.js';

const scope = (req, deleted = false) => ({ company: req.user.company, deleted });

export const create = async (req, res) => {
  if (!req.user.company) throw AppError.badRequest('Completa el onboarding');
  const client = await Client.create({
    ...req.body, user: req.user._id, company: req.user.company
  });
  emitCompany(req.user.company, 'client:new', client);
  res.status(201).json({ data: client });
};
export const list = async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = {
    ...scope(req),
    ...(req.query.name && { name: { $regex: req.query.name, $options: 'i' } })
  };
  const sort = req.query.sort || '-createdAt';
  const [data, total] = await Promise.all([
    Client.find(filter).sort(sort).skip(skip).limit(limit),
    Client.countDocuments(filter)
  ]);
  res.json(paged(data, total, page, limit));
};
export const archived = async (req, res) => res.json({ data: await Client.find(scope(req, true)) });
export const getOne = async (req, res) => {
  const data = await Client.findOne({ _id: req.params.id, company: req.user.company });
  if (!data) throw AppError.notFound('Cliente');
  res.json({ data });
};
export const update = async (req, res) => {
  const data = await Client.findOneAndUpdate(
    { _id: req.params.id, ...scope(req) }, req.body, { new: true, runValidators: true }
  );
  if (!data) throw AppError.notFound('Cliente');
  res.json({ data });
};
export const remove = async (req, res) => {
  const filter = { _id: req.params.id, company: req.user.company };
  const data = req.query.soft === 'false'
    ? await Client.findOneAndDelete(filter)
    : await Client.findOneAndUpdate(filter, { deleted: true }, { new: true });
  if (!data) throw AppError.notFound('Cliente');
  res.json({ acknowledged: true });
};
export const restore = async (req, res) => {
  const data = await Client.findOneAndUpdate(
    { _id: req.params.id, ...scope(req, true) }, { deleted: false }, { new: true }
  );
  if (!data) throw AppError.notFound('Cliente');
  res.json({ data });
};
