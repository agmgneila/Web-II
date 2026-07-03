import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true, minlength: 2 },
  description: { type: String, default: '', maxlength: 300 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatUser', required: true }
}, { timestamps: true, versionKey: false });

export default mongoose.model('Room', roomSchema);
