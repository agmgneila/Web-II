import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatUser', required: true },
  content: { type: String, required: true, trim: true, maxlength: 2000 }
}, { timestamps: true, versionKey: false });

messageSchema.index({ room: 1, createdAt: -1 });
export default mongoose.model('Message', messageSchema);
