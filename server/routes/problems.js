const express = require('express');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const problemService = require('../services/problemService');
const ApiResponse = require('../utils/response');

const router = express.Router();

// @route   GET /api/problems
// @desc    Get all problems with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const filters = {
      difficulty: req.query.difficulty,
      tags: req.query.tags,
      search: req.query.search,
      topic: req.query.topic
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const result = await problemService.getProblems(filters, pagination);

    // Get user's solved problems
    const user = await User.findById(req.user.id);
    const solvedProblemIds = user.solvedProblems.map(sp => sp.problemId.toString());

    // Add solved status to each problem
    const problemsWithStatus = result.problems.map(problem => ({
      ...problem.toObject(),
      isSolved: solvedProblemIds.includes(problem._id.toString())
    }));

    ApiResponse.success(res, {
      problems: problemsWithStatus,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Get problems error:', error);
    ApiResponse.error(res, 'Failed to fetch problems');
  }
});

// @route   GET /api/problems/search
// @desc    Search problems
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q: searchTerm, limit = 10 } = req.query;
    
    if (!searchTerm) {
      return ApiResponse.error(res, 'Search term is required', 400);
    }

    const problems = await problemService.searchProblems(searchTerm, parseInt(limit));
    ApiResponse.success(res, { problems });

  } catch (error) {
    console.error('Search problems error:', error);
    ApiResponse.error(res, 'Failed to search problems');
  }
});

// @route   GET /api/problems/random
// @desc    Get random problem
// @access  Private
router.get('/random', auth, async (req, res) => {
  try {
    const { difficulty } = req.query;
    const problem = await problemService.getRandomProblem(difficulty);
    
    if (!problem) {
      return ApiResponse.notFound(res, 'No problems found');
    }

    ApiResponse.success(res, { problem });

  } catch (error) {
    console.error('Get random problem error:', error);
    ApiResponse.error(res, 'Failed to fetch random problem');
  }
});

// @route   GET /api/problems/:slug
// @desc    Get single problem by slug
// @access  Private
router.get('/:slug', auth, async (req, res) => {
  try {
    const problem = await problemService.getProblemBySlug(req.params.slug);

    if (!problem) {
      return ApiResponse.notFound(res, 'Problem not found');
    }

    // Check if user has solved this problem
    const user = await User.findById(req.user.id);
    const solvedProblem = user.solvedProblems.find(
      sp => sp.problemId.toString() === problem._id.toString()
    );

    ApiResponse.success(res, {
      problem: {
        ...problem.toObject(),
        isSolved: !!solvedProblem,
        userBestSubmission: solvedProblem || null
      }
    });

  } catch (error) {
    console.error('Get problem error:', error);
    ApiResponse.error(res, 'Failed to fetch problem');
  }
});

// @route   GET /api/problems/:id/template/:language
// @desc    Get code template for specific language
// @access  Private
router.get('/:id/template/:language', auth, async (req, res) => {
  try {
    const { id, language } = req.params;
    
    const template = await problemService.getCodeTemplate(id, language);
    if (!template) {
      return ApiResponse.notFound(res, 'Template not found for this language');
    }

    ApiResponse.success(res, { template });

  } catch (error) {
    console.error('Get template error:', error);
    ApiResponse.error(res, 'Failed to fetch template');
  }
});

// @route   POST /api/problems
// @desc    Create new problem (Admin only)
// @access  Private (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const problem = await problemService.createProblem(req.body, req.user.id);
    ApiResponse.success(res, { problem }, 'Problem created successfully', 201);

  } catch (error) {
    console.error('Create problem error:', error);
    ApiResponse.error(res, 'Failed to create problem');
  }
});

// @route   PUT /api/problems/:id
// @desc    Update problem (Admin only)
// @access  Private (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const problem = await problemService.updateProblem(req.params.id, req.body);

    if (!problem) {
      return ApiResponse.notFound(res, 'Problem not found');
    }

    ApiResponse.success(res, { problem }, 'Problem updated successfully');

  } catch (error) {
    console.error('Update problem error:', error);
    ApiResponse.error(res, 'Failed to update problem');
  }
});

// @route   DELETE /api/problems/:id
// @desc    Delete problem (Admin only)
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!problem) {
      return ApiResponse.notFound(res, 'Problem not found');
    }

    ApiResponse.success(res, null, 'Problem deleted successfully');

  } catch (error) {
    console.error('Delete problem error:', error);
    ApiResponse.error(res, 'Failed to delete problem');
  }
});

module.exports = router;