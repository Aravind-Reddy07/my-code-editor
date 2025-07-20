const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('achievements.achievementId')
      .populate('solvedProblems.problemId', 'title difficulty slug');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats,
        solvedProblems: user.solvedProblems,
        achievements: user.achievements,
        selectedTopics: user.selectedTopics,
        streakData: user.streakData,
        acceptanceRate: user.acceptanceRate,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, avatar } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (avatar) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update settings
    user.settings = { ...user.settings, ...req.body };
    await user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/topics
// @desc    Update selected topics
// @access  Private
router.put('/topics', auth, async (req, res) => {
  try {
    const { selectedTopics } = req.body;

    if (!Array.isArray(selectedTopics)) {
      return res.status(400).json({ message: 'Selected topics must be an array' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { selectedTopics },
      { new: true }
    );

    res.json({
      message: 'Topics updated successfully',
      selectedTopics: user.selectedTopics
    });
  } catch (error) {
    console.error('Update topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/streak
// @desc    Get user streak data
// @access  Private
router.get('/streak', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Generate last 30 days streak data
    const streakData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const existingData = user.streakData.find(
        data => data.date.toDateString() === date.toDateString()
      );
      
      streakData.push({
        date: date.toISOString().split('T')[0],
        problemsSolved: existingData ? existingData.problemsSolved : 0,
        hasActivity: existingData ? existingData.problemsSolved > 0 : false
      });
    }

    res.json({
      streakData,
      currentStreak: user.stats.currentStreak,
      longestStreak: user.stats.longestStreak
    });
  } catch (error) {
    console.error('Get streak error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const users = await User.find({ 'settings.publicProfile': true })
      .select('name avatar stats')
      .sort({ 'stats.points': -1, 'stats.problemsSolved': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      ...user.toObject(),
      rank: (page - 1) * limit + index + 1
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;