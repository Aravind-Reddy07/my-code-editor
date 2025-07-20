const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['solving', 'streak', 'topic', 'speed', 'consistency'],
    required: true
  },
  criteria: {
    type: {
      type: String,
      enum: ['problems_solved', 'streak_days', 'topic_completion', 'speed_solving', 'daily_consistency'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    topic: String // for topic-specific achievements
  },
  points: {
    type: Number,
    default: 10
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);