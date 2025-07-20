const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { validationRules, validate } = require('../utils/validation');
const ApiResponse = require('../utils/response');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  validationRules.name,
  validationRules.email,
  validationRules.password,
  validate
], async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error(res, 'User already exists with this email', 400);
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    ApiResponse.success(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats,
        settings: user.settings
      }
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Registration error:', error);
    ApiResponse.error(res, 'Server error during registration');
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  validationRules.email,
  body('password').exists().withMessage('Password is required'),
  validate
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ApiResponse.unauthorized(res, 'Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.unauthorized(res, 'Invalid credentials');
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    ApiResponse.success(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats,
        settings: user.settings,
        selectedTopics: user.selectedTopics
      }
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    ApiResponse.error(res, 'Server error during login');
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('achievements.achievementId')
      .populate('solvedProblems.problemId', 'title difficulty');

    ApiResponse.success(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats,
        settings: user.settings,
        selectedTopics: user.selectedTopics,
        achievements: user.achievements,
        solvedProblems: user.solvedProblems,
        acceptanceRate: user.acceptanceRate
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    ApiResponse.error(res, 'Server error');
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  ApiResponse.success(res, null, 'Logged out successfully');
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const token = generateToken(req.user.id);
    ApiResponse.success(res, { token }, 'Token refreshed successfully');
  } catch (error) {
    console.error('Token refresh error:', error);
    ApiResponse.error(res, 'Failed to refresh token');
  }
});

module.exports = router;