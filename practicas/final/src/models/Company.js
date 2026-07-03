import mongoose from 'mongoose';

const address = {
  street: { type: String, trim: true },
  number: { type: String, trim: true },
  postal: { type: String, trim: true },
  city: { type: String, trim: true },
  province: { type: String, trim: true }
};

const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'BildyUser', required: true },
  name: { type: String, required: true, trim: true },
  cif: { type: String, required: true, unique: true, uppercase: true, trim: true },
  address,
  logo: { type: String, default: null },
  isFreelance: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false, index: true }
}, { timestamps: true, versionKey: false });

export default mongoose.model('Company', schema);
