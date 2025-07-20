const express = require('express');
const Topic = require('../models/Topic');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/topics
// @desc    Get all topics
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const topics = await Topic.find({ isActive: true })
      .populate('problems', 'title slug difficulty')
      .sort({ order: 1 });

    // Get user's progress for each topic
    const user = await User.findById(req.user.id);
    const solvedProblemIds = user.solvedProblems.map(sp => sp.problemId.toString());

    const topicsWithProgress = topics.map(topic => {
      const topicProblems = topic.problems || [];
      const solvedCount = topicProblems.filter(problem => 
        solvedProblemIds.includes(problem._id.toString())
      ).length;

      return {
        ...topic.toObject(),
        problems: topicProblems.length,
        solvedProblems: solvedCount,
        progress: topicProblems.length > 0 ? (solvedCount / topicProblems.length) * 100 : 0,
        isSelected: user.selectedTopics.includes(topic.id)
      };
    });

    res.json({ topics: topicsWithProgress });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/topics/:id
// @desc    Get single topic with problems
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const topic = await Topic.findOne({ 
      id: req.params.id, 
      isActive: true 
    }).populate('problems');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Get user's solved problems
    const user = await User.findById(req.user.id);
    const solvedProblemIds = user.solvedProblems.map(sp => sp.problemId.toString());

    // Add solved status to problems
    const problemsWithStatus = topic.problems.map(problem => ({
      ...problem.toObject(),
      isSolved: solvedProblemIds.includes(problem._id.toString())
    }));

    res.json({
      topic: {
        ...topic.toObject(),
        problems: problemsWithStatus
      }
    });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/topics
// @desc    Create new topic (Admin only)
// @access  Private (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const topic = new Topic(req.body);
    await topic.save();

    res.status(201).json({
      message: 'Topic created successfully',
      topic
    });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/topics/:id
// @desc    Update topic (Admin only)
// @access  Private (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const topic = await Topic.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    res.json({
      message: 'Topic updated successfully',
      topic
    });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;