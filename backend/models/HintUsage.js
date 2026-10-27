import mongoose from 'mongoose';

const { Schema } = mongoose;

const hintUsageSchema = new Schema({
  userId: { type: String, default: 'guest_user' },
  problemId: { type: Schema.Types.Mixed, required: true },
  hintLevel: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const HintUsage = mongoose.models.HintUsage || mongoose.model('HintUsage', hintUsageSchema);
