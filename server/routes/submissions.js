const express = require('express');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const auth = require('../middleware/auth');
const { executeCode } = require('../services/codeExecution');
const { successResponse, errorResponse } = require('../utils/response');

const router = express.Router();

// Rate limiting for code execution
const codeExecutionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.CODE_EXECUTION_RATE_LIMIT) || 10,
  message: 'Too many code execution requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Submit and execute code
router.post('/execute', auth, codeExecutionLimiter, [
  body('problemId').isMongoId().withMessage('Invalid problem ID'),
  body('code').notEmpty().withMessage('Code is required'),
  body('language').isIn(['javascript', 'python', 'typescript']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 400, errors.array());
    }

    const { problemId, code, language } = req.body;
    const userId = req.user.userId;

    // Get problem with test cases
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return errorResponse(res, 'Problem not found', 404);
    }

    // Execute code against test cases
    const executionResult = await executeCode(code, language, problem.testCases);

    // Create submission record
    const submission = new Submission({
      userId,
      problemId,
      code,
      language,
      status: executionResult.status,
      executionTime: executionResult.executionTime,
      memoryUsed: executionResult.memoryUsed,
      testResults: executionResult.testResults,
      error: executionResult.error
    });

    await submission.save();

    // Update problem statistics if accepted
    if (executionResult.status === 'Accepted') {
      await Problem.findByIdAndUpdate(problemId, {
        $inc: { acceptedSubmissions: 1 }
      });
    }

    await Problem.findByIdAndUpdate(problemId, {
      $inc: { totalSubmissions: 1 }
    });

    successResponse(res, 'Code executed successfully', {
      submissionId: submission._id,
      status: executionResult.status,
      executionTime: executionResult.executionTime,
      memoryUsed: executionResult.memoryUsed,
      testResults: executionResult.testResults.map(result => ({
        passed: result.passed,
        input: result.input,
        expected: result.expected,
        actual: result.actual,
        error: result.error
      })),
      error: executionResult.error
    });

  } catch (error) {
    console.error('Code execution error:', error);
    errorResponse(res, 'Code execution failed', 500);
  }
});

// Get user submissions
router.get('/user/:userId?', auth, async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    // Users can only view their own submissions unless admin
    if (userId !== req.user.userId) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const submissions = await Submission.find({ userId })
      .populate('problemId', 'title difficulty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-code'); // Exclude code for list view

    const total = await Submission.countDocuments({ userId });

    successResponse(res, 'Submissions retrieved successfully', {
      submissions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    errorResponse(res, 'Server error', 500);
  }
});

// Get specific submission
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problemId', 'title difficulty')
      .populate('userId', 'username');

    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }

    // Users can only view their own submissions
    if (submission.userId._id.toString() !== req.user.userId) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    successResponse(res, 'Submission retrieved successfully', { submission });
  } catch (error) {
    console.error('Get submission error:', error);
    errorResponse(res, 'Server error', 500);
  }
});

// Get problem submissions (for problem statistics)
router.get('/problem/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const stats = await Submission.aggregate([
      { $match: { problemId: mongoose.Types.ObjectId(problemId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSubmissions = await Submission.countDocuments({ problemId });
    const acceptedSubmissions = stats.find(s => s._id === 'Accepted')?.count || 0;
    const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions * 100).toFixed(2) : 0;

    successResponse(res, 'Problem submission statistics retrieved', {
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate: parseFloat(acceptanceRate),
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Get problem submissions error:', error);
    errorResponse(res, 'Server error', 500);
  }
});

module.exports = router;