const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// Get all problems with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  query('topic').optional().isString().withMessage('Topic must be a string'),
  query('search').optional().isString().withMessage('Search must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    
    if (req.query.topic) {
      filter.topics = { $in: [req.query.topic] };
    }
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const problems = await Problem.find(filter)
      .select('-testCases.hidden') // Exclude hidden test cases
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Problem.countDocuments(filter);

    successResponse(res, 'Problems retrieved successfully', {
      problems,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get problems error:', error);
    errorResponse(res, 'Server error', 500);
  }
});

// Get single problem by ID
router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .select('-testCases.hidden'); // Exclude hidden test cases for regular users

    if (!problem) {
      return errorResponse(res, 'Problem not found', 404);
    }

    successResponse(res, 'Problem retrieved successfully', { problem });
  } catch (error) {
    console.error('Get problem error:', error);
    if (error.name === 'CastError') {
      return errorResponse(res, 'Invalid problem ID', 400);
    }
    errorResponse(res, 'Server error', 500);
  }
});

// Create new problem (admin only)
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  body('description').notEmpty().withMessage('Description is required'),
  body('examples').isArray().withMessage('Examples must be an array'),
  body('testCases').isObject().withMessage('Test cases must be an object'),
  body('codeTemplates').isObject().withMessage('Code templates must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const problem = new Problem(req.body);
    await problem.save();

    successResponse(res, 'Problem created successfully', { problem }, 201);
  } catch (error) {
    console.error('Create problem error:', error);
    errorResponse(res, 'Server error', 500);
  }
});

// Get problem statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return errorResponse(res, 'Problem not found', 404);
    }

    // You can expand this to include submission statistics
    const stats = {
      totalSubmissions: problem.submissions || 0,
      acceptanceRate: problem.acceptanceRate || 0,
      difficulty: problem.difficulty,
      topics: problem.topics
    };

    successResponse(res, 'Problem statistics retrieved', { stats });
  } catch (error) {
    console.error('Get problem stats error:', error);
    errorResponse(res, 'Server error', 500);
  }
});

module.exports = router;