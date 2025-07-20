const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard']
  },
  description: {
    type: String,
    required: [true, 'Problem description is required']
  },
  examples: [{
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: String
  }],
  constraints: [String],
  tags: [{
    type: String,
    enum: ['arrays', 'strings', 'linked-lists', 'stacks-queues', 'trees', 'graphs', 'dynamic-programming', 'sliding-window', 'two-pointers', 'hash-table', 'sorting', 'binary-search', 'backtracking', 'greedy', 'math', 'bit-manipulation']
  }],
  companies: [String],
  hints: [String],
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }],
  codeTemplates: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
    typescript: String
  },
  solution: {
    approach: String,
    timeComplexity: String,
    spaceComplexity: String,
    code: {
      javascript: String,
      python: String,
      java: String,
      cpp: String,
      typescript: String
    }
  },
  stats: {
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    averageRuntime: { type: Number, default: 0 },
    averageMemory: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes for better query performance
problemSchema.index({ difficulty: 1, tags: 1 });
problemSchema.index({ slug: 1 });
problemSchema.index({ isActive: 1, order: 1 });

// Update acceptance rate before saving
problemSchema.pre('save', function(next) {
  if (this.stats.totalSubmissions > 0) {
    this.stats.acceptanceRate = ((this.stats.acceptedSubmissions / this.stats.totalSubmissions) * 100).toFixed(1);
  }
  next();
});

// Generate slug from title
problemSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Problem', problemSchema);