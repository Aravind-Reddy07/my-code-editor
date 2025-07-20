const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.email}`;
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  stats: {
    problemsSolved: { type: Number, default: 0 },
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastSolvedDate: { type: Date },
    rank: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  },
  solvedProblems: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
    solvedAt: { type: Date, default: Date.now },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
    language: String,
    runtime: Number,
    memory: Number
  }],
  achievements: [{
    achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
    earnedAt: { type: Date, default: Date.now }
  }],
  selectedTopics: [{
    type: String,
    enum: ['arrays', 'strings', 'linked-lists', 'stacks-queues', 'trees', 'graphs', 'dynamic-programming', 'sliding-window', 'two-pointers']
  }],
  settings: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    fontSize: { type: Number, default: 14 },
    codeTheme: { type: String, default: 'vs-light' },
    defaultLanguage: { type: String, default: 'javascript' },
    autoSave: { type: Boolean, default: true },
    showLineNumbers: { type: Boolean, default: true },
    wordWrap: { type: Boolean, default: false },
    dailyReminders: { type: Boolean, default: true },
    achievementNotifications: { type: Boolean, default: true },
    weeklyProgress: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true },
    showStatistics: { type: Boolean, default: true }
  },
  streakData: [{
    date: { type: Date, required: true },
    problemsSolved: { type: Number, default: 0 }
  }],
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ 'stats.rank': 1 });
userSchema.index({ 'stats.points': -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak method
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastSolved = this.stats.lastSolvedDate;
  
  if (!lastSolved) {
    this.stats.currentStreak = 1;
  } else {
    const lastSolvedDate = new Date(lastSolved);
    lastSolvedDate.setHours(0, 0, 0, 0);
    
    if (lastSolvedDate.getTime() === yesterday.getTime()) {
      this.stats.currentStreak += 1;
    } else if (lastSolvedDate.getTime() !== today.getTime()) {
      this.stats.currentStreak = 1;
    }
  }
  
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  
  this.stats.lastSolvedDate = new Date();
};

// Calculate acceptance rate
userSchema.virtual('acceptanceRate').get(function() {
  if (this.stats.totalSubmissions === 0) return 0;
  return ((this.stats.acceptedSubmissions / this.stats.totalSubmissions) * 100).toFixed(1);
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);