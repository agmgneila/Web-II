import sharp from 'sharp';
import Client from '../models/Client.js';
import DeliveryNote from '../models/DeliveryNote.js';
import Project from '../models/Project.js';
import { generatePdf } from '../services/pdf.service.js';
import { emitCompany } from '../services/socket.service.js';
import { uploadBuffer } from '../services/storage.service.js';
import AppError from '../utils/AppError.js';
import { paged, pagination } from '../utils/pagination.js';

const populated = (query) => query
  .populate('user', 'name lastName email')
  .populate('company')
  .populate('client')
  .populate('project');

export const create = async (req, res) => {
  const project = await Project.findOne({
    _id: req.body.project, company: req.user.company, client: req.body.client, deleted: false
  });
  const client = await Client.exists({ _id: req.body.client, company: req.user.company, deleted: false });
  if (!project || !client) throw AppError.badRequest('Cliente o proyecto inválido');
  const note = await DeliveryNote.create({
    ...req.body, user: req.user._id, company: req.user.company
  });
  emitCompany(req.user.company, 'deliverynote:new', note);
  res.status(201).json({ data: note });
};

export const list = async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = {
    company: req.user.company, deleted: false,
    ...(req.query.project && { project: req.query.project }),
    ...(req.query.client && { client: req.query.client }),
    ...(req.query.format && { format: req.query.format }),
    ...(req.query.signed && { signed: req.query.signed === 'true' }),
    ...((req.query.from || req.query.to) && {
      workDate: {
        ...(req.query.from && { $gte: new Date(req.query.from) }),
        ...(req.query.to && { $lte: new Date(req.query.to) })
      }
    })
  };
  const [data, total] = await Promise.all([
    DeliveryNote.find(filter).sort(req.query.sort || '-workDate').skip(skip).limit(limit),
    DeliveryNote.countDocuments(filter)
  ]);
  res.json(paged(data, total, page, limit));
};

export const getOne = async (req, res) => {
  const data = await populated(DeliveryNote.findOne({
    _id: req.params.id, company: req.user.company, deleted: false
  }));
  if (!data) throw AppError.notFound('Albarán');
  res.json({ data });
};

export const pdf = async (req, res) => {
  const note = await populated(DeliveryNote.findOne({
    _id: req.params.id, company: req.user.company, deleted: false
  }));
  if (!note) throw AppError.notFound('Albarán');
  if (note.signed && note.pdfUrl && !note.pdfUrl.startsWith('test://')) return res.redirect(note.pdfUrl);
  const buffer = await generatePdf(note);
  res.type('application/pdf').attachment(`albaran-${note.id}.pdf`).send(buffer);
};

export const sign = async (req, res) => {
  if (!req.file) throw AppError.badRequest('Se requiere la imagen de firma');
  const note = await populated(DeliveryNote.findOne({
    _id: req.params.id, company: req.user.company, deleted: false
  }));
  if (!note) throw AppError.notFound('Albarán');
  if (note.signed) throw AppError.conflict('El albarán ya está firmado');
  const optimized = await sharp(req.file.buffer).resize({ width: 800, withoutEnlargement: true }).webp().toBuffer();
  const signature = await uploadBuffer(optimized, {
    folder: 'bildyapp/signatures', resource_type: 'image'
  });
  note.signed = true;
  note.signedAt = new Date();
  note.signatureUrl = signature.secure_url;
  const pdfBuffer = await generatePdf(note);
  const uploadedPdf = await uploadBuffer(pdfBuffer, {
    folder: 'bildyapp/deliverynotes', resource_type: 'raw',
    public_id: `deliverynote-${note.id}.pdf`
  });
  note.pdfUrl = uploadedPdf.secure_url;
  await note.save();
  emitCompany(req.user.company, 'deliverynote:signed', note);
  res.json({ data: note });
};

export const remove = async (req, res) => {
  const note = await DeliveryNote.findOne({ _id: req.params.id, company: req.user.company });
  if (!note) throw AppError.notFound('Albarán');
  if (note.signed) throw AppError.conflict('Un albarán firmado no se puede borrar');
  await note.deleteOne();
  res.json({ acknowledged: true });
};
