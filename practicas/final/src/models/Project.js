import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'BildyUser', required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true, index: true },
  name: { type: String, required: true, trim: true },
  projectCode: { type: String, required: true, uppercase: true, trim: true },
  address: { street: String, number: String, postal: String, city: String, province: String },
  email: { type: String, lowercase: true, trim: true },
  notes: { type: String, maxlength: 2000 },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false, index: true }
}, { timestamps: true, versionKey: false });
schema.index({ company: 1, projectCode: 1 }, { unique: true });
export default mongoose.model('Project', schema);
