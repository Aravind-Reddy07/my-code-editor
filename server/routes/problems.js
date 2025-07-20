const express = require('express');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/problems
// @desc    Get all problems with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      difficulty, 
      tags, 
      search,
      topic 
    } = req.query;

    const query = { isActive: true };

    // Apply filters
    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (topic) {
      query.tags = { $in: [topic] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const problems = await Problem.find(query)
      .select('title slug difficulty tags stats examples constraints')
      .sort({ order: 1, createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Problem.countDocuments(query);

    // Get user's solved problems
    const user = await User.findById(req.user.id);
    const solvedProblemIds = user.solvedProblems.map(sp => sp.problemId.toString());

    // Add solved status to each problem
    const problemsWithStatus = problems.map(problem => ({
      ...problem.toObject(),
      isSolved: solvedProblemIds.includes(problem._id.toString())
    }));

    res.json({
      problems: problemsWithStatus,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/problems/:slug
// @desc    Get single problem by slug
// @access  Private
router.get('/:slug', auth, async (req, res) => {
  try {
    const problem = await Problem.findOne({ 
      slug: req.params.slug, 
      isActive: true 
    });

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Check if user has solved this problem
    const user = await User.findById(req.user.id);
    const solvedProblem = user.solvedProblems.find(
      sp => sp.problemId.toString() === problem._id.toString()
    );

    res.json({
      problem: {
        ...problem.toObject(),
        isSolved: !!solvedProblem,
        userBestSubmission: solvedProblem || null
      }
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/problems/:id/template/:language
// @desc    Get code template for specific language
// @access  Private
router.get('/:id/template/:language', auth, async (req, res) => {
  try {
    const { id, language } = req.params;
    
    const problem = await Problem.findById(id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const template = problem.codeTemplates[language];
    if (!template) {
      return res.status(404).json({ message: 'Template not found for this language' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/problems
// @desc    Create new problem (Admin only)
// @access  Private (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const problem = new Problem({
      ...req.body,
      createdBy: req.user.id
    });

    await problem.save();

    res.status(201).json({
      message: 'Problem created successfully',
      problem
    });
  } catch (error) {
    console.error('Create problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/problems/:id
// @desc    Update problem (Admin only)
// @access  Private (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({
      message: 'Problem updated successfully',
      problem
    });
  } catch (error) {
    console.error('Update problem error:', error);
    res.status(500).json({ message: 'Server error' });
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
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Delete problem error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;