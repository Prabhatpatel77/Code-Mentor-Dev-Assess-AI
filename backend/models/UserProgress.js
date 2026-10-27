import mongoose from 'mongoose';

const { Schema } = mongoose;

const userProgressSchema = new Schema({
  userId: { type: String, required: true, unique: true, default: 'default_user' },
  problemsAttempted: [{ type: String }],
  problemsSolved: [{ type: String }],
  hintsUsed: { type: Map, of: Number, default: {} }, // problemId -> count of hints requested
  topicPerformance: {
    Arrays: { attempted: { type: Number, default: 0 }, solved: { type: Number, default: 0 } },
    Strings: { attempted: { type: Number, default: 0 }, solved: { type: Number, default: 0 } },
    HashMap: { attempted: { type: Number, default: 0 }, solved: { type: Number, default: 0 } },
    'Two Pointers': { attempted: { type: Number, default: 0 }, solved: { type: Number, default: 0 } },
    Recursion: { attempted: { type: Number, default: 0 }, solved: { type: Number, default: 0 } }
  },
  updatedAt: { type: Date, default: Date.now }
});

export const UserProgress = mongoose.models.UserProgress || mongoose.model('UserProgress', userProgressSchema);
