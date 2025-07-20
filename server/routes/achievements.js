const express = require('express');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/achievements
// @desc    Get all achievements
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true })
      .sort({ category: 1, points: 1 });

    // Get user's earned achievements
    const user = await User.findById(req.user.id);
    const earnedAchievementIds = user.achievements.map(a => a.achievementId.toString());

    const achievementsWithStatus = achievements.map(achievement => ({
      ...achievement.toObject(),
      isEarned: earnedAchievementIds.includes(achievement._id.toString()),
      earnedAt: user.achievements.find(a => 
        a.achievementId.toString() === achievement._id.toString()
      )?.earnedAt || null
    }));

    res.json({ achievements: achievementsWithStatus });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/achievements/user
// @desc    Get user's earned achievements
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('achievements.achievementId');

    const earnedAchievements = user.achievements.map(achievement => ({
      ...achievement.achievementId.toObject(),
      earnedAt: achievement.earnedAt
    }));

    res.json({ 
      achievements: earnedAchievements,
      totalPoints: earnedAchievements.reduce((sum, a) => sum + a.points, 0)
    });
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/achievements
// @desc    Create new achievement (Admin only)
// @access  Private (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const achievement = new Achievement(req.body);
    await achievement.save();

    res.status(201).json({
      message: 'Achievement created successfully',
      achievement
    });
  } catch (error) {
    console.error('Create achievement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;