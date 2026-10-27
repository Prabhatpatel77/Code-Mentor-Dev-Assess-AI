import mongoose from 'mongoose';

const { Schema } = mongoose;

const submissionSchema = new Schema({
  userId: { type: String, required: true, default: 'default_user' },
  problemId: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  status: { 
    type: String, 
    enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Pending'], 
    default: 'Pending' 
  },
  testsPassed: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  executionTimeMs: { type: Number, default: 0 },
  testResults: [
    {
      input: Schema.Types.Mixed,
      expectedOutput: Schema.Types.Mixed,
      actualOutput: Schema.Types.Mixed,
      passed: Boolean,
      error: String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
