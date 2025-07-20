const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: [true, 'Code is required']
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'typescript']
  },
  status: {
    type: String,
    required: true,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compile Error', 'Pending']
  },
  runtime: {
    type: Number, // in milliseconds
    default: null
  },
  memory: {
    type: Number, // in MB
    default: null
  },
  testCaseResults: [{
    testCaseId: String,
    status: { type: String, enum: ['passed', 'failed', 'error'] },
    input: String,
    expectedOutput: String,
    actualOutput: String,
    runtime: Number,
    memory: Number,
    errorMessage: String
  }],
  errorMessage: String,
  passedTestCases: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false },
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
submissionSchema.index({ userId: 1, createdAt: -1 });
submissionSchema.index({ problemId: 1, status: 1 });
submissionSchema.index({ userId: 1, problemId: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);