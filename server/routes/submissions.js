const express = require('express');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { executeCode } = require('../services/codeExecution');
const { checkAchievements } = require('../services/achievementService');
const { validationRules, validate } = require('../utils/validation');
const ApiResponse = require('../utils/response');

const router = express.Router();

// @route   POST /api/submissions
// @desc    Submit code for a problem
// @access  Private
router.post('/', [
  auth,
  validationRules.problemId,
  validationRules.code,
  validationRules.language,
  validate
], async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return ApiResponse.notFound(res, 'Problem not found');
    }

    // Create submission
    const submission = new Submission({
      userId: req.user.id,
      problemId,
      code,
      language,
      status: 'Pending'
    });

    await submission.save();

    // Execute code against test cases
    try {
      const executionResult = await executeCode(code, language, problem.testCases);
      
      // Update submission with results
      submission.status = executionResult.status;
      submission.runtime = executionResult.runtime;
      submission.memory = executionResult.memory;
      submission.testCaseResults = executionResult.testCaseResults;
      submission.passedTestCases = executionResult.passedTestCases;
      submission.totalTestCases = executionResult.totalTestCases;
      submission.errorMessage = executionResult.errorMessage;

      await submission.save();

      // Update problem stats
      problem.stats.totalSubmissions += 1;
      if (executionResult.status === 'Accepted') {
        problem.stats.acceptedSubmissions += 1;
      }
      await problem.save();

      // Update user stats
      const user = await User.findById(req.user.id);
      user.stats.totalSubmissions += 1;

      if (executionResult.status === 'Accepted') {
        user.stats.acceptedSubmissions += 1;
        
        // Check if this is the first time solving this problem
        const alreadySolved = user.solvedProblems.some(
          sp => sp.problemId.toString() === problemId
        );

        if (!alreadySolved) {
          user.stats.problemsSolved += 1;
          user.solvedProblems.push({
            problemId,
            difficulty: problem.difficulty,
            language,
            runtime: executionResult.runtime,
            memory: executionResult.memory
          });

          // Update streak
          user.updateStreak();

          // Update streak data
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const todayStreak = user.streakData.find(
            data => data.date.toDateString() === today.toDateString()
          );

          if (todayStreak) {
            todayStreak.problemsSolved += 1;
          } else {
            user.streakData.push({
              date: today,
              problemsSolved: 1
            });
          }

          // Add points based on difficulty
          const points = { Easy: 10, Medium: 20, Hard: 30 };
          user.stats.points += points[problem.difficulty] || 10;

          // Check for achievements
          await checkAchievements(user);
        }
      }

      await user.save();

      // Filter out hidden test case results for response
      const visibleTestCaseResults = submission.testCaseResults.filter(tcr => !tcr.isHidden);

      ApiResponse.success(res, {
        submission: {
          id: submission._id,
          status: submission.status,
          runtime: submission.runtime,
          memory: submission.memory,
          passedTestCases: submission.passedTestCases,
          totalTestCases: submission.totalTestCases,
          testCaseResults: visibleTestCaseResults,
          errorMessage: submission.errorMessage
        }
      }, 'Code submitted successfully');

    } catch (executionError) {
      console.error('Code execution error:', executionError);
      
      submission.status = 'Runtime Error';
      submission.errorMessage = executionError.message;
      await submission.save();

      ApiResponse.success(res, {
        submission: {
          id: submission._id,
          status: submission.status,
          errorMessage: submission.errorMessage
        }
      }, 'Code execution failed');
    }

  } catch (error) {
    console.error('Submit code error:', error);
    ApiResponse.error(res, 'Failed to submit code');
  }
});

// @route   POST /api/submissions/run
// @desc    Run code against sample test cases
// @access  Private
router.post('/run', [
  auth,
  validationRules.problemId,
  validationRules.code,
  validationRules.language,
  validate
], async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return ApiResponse.notFound(res, 'Problem not found');
    }

    // Get only sample test cases (first 3 or non-hidden ones)
    const sampleTestCases = problem.testCases
      .filter(tc => !tc.isHidden)
      .slice(0, 3);

    // Execute code
    const executionResult = await executeCode(code, language, sampleTestCases);

    ApiResponse.success(res, {
      result: {
        status: executionResult.status,
        runtime: executionResult.runtime,
        memory: executionResult.memory,
        testCaseResults: executionResult.testCaseResults,
        passedTestCases: executionResult.passedTestCases,
        totalTestCases: executionResult.totalTestCases,
        errorMessage: executionResult.errorMessage
      }
    }, 'Code executed successfully');

  } catch (error) {
    console.error('Run code error:', error);
    ApiResponse.error(res, 'Failed to execute code');
  }
});

// @route   GET /api/submissions
// @desc    Get user submissions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, problemId, status } = req.query;
    
    const query = { userId: req.user.id };
    
    if (problemId) query.problemId = problemId;
    if (status) query.status = status;

    const submissions = await Submission.find(query)
      .populate('problemId', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments(query);

    ApiResponse.success(res, {
      submissions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get submissions error:', error);
    ApiResponse.error(res, 'Failed to fetch submissions');
  }
});

// @route   GET /api/submissions/:id
// @desc    Get single submission
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('problemId', 'title slug difficulty');

    if (!submission) {
      return ApiResponse.notFound(res, 'Submission not found');
    }

    ApiResponse.success(res, { submission });

  } catch (error) {
    console.error('Get submission error:', error);
    ApiResponse.error(res, 'Failed to fetch submission');
  }
});

// @route   GET /api/submissions/problem/:problemId
// @desc    Get submissions for a specific problem
// @access  Private
router.get('/problem/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const submissions = await Submission.find({
      userId: req.user.id,
      problemId
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Submission.countDocuments({
      userId: req.user.id,
      problemId
    });

    ApiResponse.success(res, {
      submissions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get problem submissions error:', error);
    ApiResponse.error(res, 'Failed to fetch problem submissions');
  }
});

module.exports = router;