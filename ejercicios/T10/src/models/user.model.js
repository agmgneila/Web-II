import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  online: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

export default mongoose.model('ChatUser', userSchema);
