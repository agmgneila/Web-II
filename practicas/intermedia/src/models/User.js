import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  name: { type: String, trim: true },
  lastName: { type: String, trim: true },
  nif: { type: String, uppercase: true, trim: true },
  role: { type: String, enum: ['admin', 'guest'], default: 'admin', index: true },
  status: { type: String, enum: ['pending', 'verified'], default: 'pending', index: true },
  verificationCode: { type: String, select: false },
  verificationAttempts: { type: Number, default: 3, select: false },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true },
  address: {
    street: String, number: String, postal: String, city: String, province: String
  },
  refreshTokens: { type: [String], default: [], select: false },
  deleted: { type: Boolean, default: false, index: true }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true, transform: (_doc, ret) => {
    delete ret.password;
    delete ret.verificationCode;
    delete ret.refreshTokens;
    return ret;
  } }
});

schema.virtual('fullName').get(function fullName() {
  return [this.name, this.lastName].filter(Boolean).join(' ');
});

export default mongoose.model('BildyUser', schema);
