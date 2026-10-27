import mongoose from 'mongoose';

const { Schema } = mongoose;

const exampleSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String }
});

const testCaseSchema = new Schema({
  input: { type: Schema.Types.Mixed, required: true },
  expectedOutput: { type: Schema.Types.Mixed, required: true },
  isHidden: { type: Boolean, default: false }
});

const problemSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'], 
    default: 'Easy' 
  },
  topic: { 
    type: String, 
    required: true
  },
  starterCode: { 
    type: String, 
    default: 'function solution(input) {\n  // Write your code here\n  return input;\n}' 
  },
  examples: [exampleSchema],
  testCases: [testCaseSchema],
  createdAt: { type: Date, default: Date.now }
});

export const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);
