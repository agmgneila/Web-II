import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'BildyUser', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  name: { type: String, required: true, trim: true },
  cif: { type: String, required: true, uppercase: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  address: { street: String, number: String, postal: String, city: String, province: String },
  deleted: { type: Boolean, default: false, index: true }
}, { timestamps: true, versionKey: false });
schema.index({ company: 1, cif: 1 }, { unique: true });
export default mongoose.model('Client', schema);
