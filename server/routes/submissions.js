const express = require('express');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { executeCode } = require('../services/codeExecution');
const { checkAchievements } = require('../services/achievementService');

const router = express.Router();

// @route   POST /api/submissions
// @desc    Submit code for a problem
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'Problem ID, code, and language are required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
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

      res.json({
        message: 'Code submitted successfully',
        submission: {
          id: submission._id,
          status: submission.status,
          runtime: submission.runtime,
          memory: submission.memory,
          passedTestCases: submission.passedTestCases,
          totalTestCases: submission.totalTestCases,
          testCaseResults: submission.testCaseResults.filter(tcr => !tcr.isHidden),
          errorMessage: submission.errorMessage
        }
      });

    } catch (executionError) {
      console.error('Code execution error:', executionError);
      
      submission.status = 'Runtime Error';
      submission.errorMessage = executionError.message;
      await submission.save();

      res.json({
        message: 'Code execution failed',
        submission: {
          id: submission._id,
          status: submission.status,
          errorMessage: submission.errorMessage
        }
      });
    }

  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/submissions/run
// @desc    Run code against sample test cases
// @access  Private
router.post('/run', auth, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({ message: 'Problem ID, code, and language are required' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Get only sample test cases (first 3 or non-hidden ones)
    const sampleTestCases = problem.testCases
      .filter(tc => !tc.isHidden)
      .slice(0, 3);

    // Execute code
    const executionResult = await executeCode(code, language, sampleTestCases);

    res.json({
      message: 'Code executed successfully',
      result: {
        status: executionResult.status,
        runtime: executionResult.runtime,
        memory: executionResult.memory,
        testCaseResults: executionResult.testCaseResults,
        passedTestCases: executionResult.passedTestCases,
        totalTestCases: executionResult.totalTestCases,
        errorMessage: executionResult.errorMessage
      }
    });

  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({ message: 'Server error' });
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

    res.json({
      submissions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
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
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({ submission });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;