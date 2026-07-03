import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'BildyUser', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  format: { type: String, enum: ['material', 'hours'], required: true },
  description: { type: String, required: true, trim: true },
  workDate: { type: Date, required: true },
  material: String,
  quantity: Number,
  unit: String,
  hours: Number,
  workers: [{ name: String, hours: Number, _id: false }],
  signed: { type: Boolean, default: false, index: true },
  signedAt: Date,
  signatureUrl: String,
  pdfUrl: String,
  deleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
export default mongoose.model('DeliveryNote', schema);
