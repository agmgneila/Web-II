import Client from '../models/Client.js';
import Project from '../models/Project.js';
import { emitCompany } from '../services/socket.service.js';
import AppError from '../utils/AppError.js';
import { paged, pagination } from '../utils/pagination.js';

const ensureClient = async (id, company) => {
  if (!(await Client.exists({ _id: id, company, deleted: false }))) throw AppError.badRequest('Cliente inválido');
};
export const create = async (req, res) => {
  await ensureClient(req.body.client, req.user.company);
  const project = await Project.create({ ...req.body, user: req.user._id, company: req.user.company });
  emitCompany(req.user.company, 'project:new', project);
  res.status(201).json({ data: project });
};
export const list = async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = {
    company: req.user.company, deleted: false,
    ...(req.query.client && { client: req.query.client }),
    ...(req.query.name && { name: { $regex: req.query.name, $options: 'i' } }),
    ...(req.query.active && { active: req.query.active === 'true' })
  };
  const [data, total] = await Promise.all([
    Project.find(filter).populate('client').sort(req.query.sort || '-createdAt').skip(skip).limit(limit),
    Project.countDocuments(filter)
  ]);
  res.json(paged(data, total, page, limit));
};
export const archived = async (req, res) => res.json({
  data: await Project.find({ company: req.user.company, deleted: true }).populate('client')
});
export const getOne = async (req, res) => {
  const data = await Project.findOne({ _id: req.params.id, company: req.user.company }).populate('client');
  if (!data) throw AppError.notFound('Proyecto');
  res.json({ data });
};
export const update = async (req, res) => {
  if (req.body.client) await ensureClient(req.body.client, req.user.company);
  const data = await Project.findOneAndUpdate(
    { _id: req.params.id, company: req.user.company, deleted: false },
    req.body, { new: true, runValidators: true }
  );
  if (!data) throw AppError.notFound('Proyecto');
  res.json({ data });
};
export const remove = async (req, res) => {
  const filter = { _id: req.params.id, company: req.user.company };
  const data = req.query.soft === 'false'
    ? await Project.findOneAndDelete(filter)
    : await Project.findOneAndUpdate(filter, { deleted: true }, { new: true });
  if (!data) throw AppError.notFound('Proyecto');
  res.json({ acknowledged: true });
};
export const restore = async (req, res) => {
  const data = await Project.findOneAndUpdate(
    { _id: req.params.id, company: req.user.company, deleted: true },
    { deleted: false }, { new: true }
  );
  if (!data) throw AppError.notFound('Proyecto');
  res.json({ data });
};
