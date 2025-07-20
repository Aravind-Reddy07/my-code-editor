const Problem = require('../models/Problem');

class ProblemService {
  // Get problems with filters and pagination
  async getProblems(filters = {}, pagination = {}) {
    const {
      difficulty,
      tags,
      search,
      topic,
      page = 1,
      limit = 20
    } = { ...filters, ...pagination };

    const query = { isActive: true };

    // Apply filters
    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
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

    return {
      problems,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    };
  }

  // Get single problem by slug
  async getProblemBySlug(slug) {
    return await Problem.findOne({ 
      slug, 
      isActive: true 
    });
  }

  // Create new problem
  async createProblem(problemData, createdBy) {
    const problem = new Problem({
      ...problemData,
      createdBy
    });

    return await problem.save();
  }

  // Update problem
  async updateProblem(id, updateData) {
    return await Problem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  // Update problem statistics
  async updateProblemStats(problemId, isAccepted) {
    const problem = await Problem.findById(problemId);
    if (!problem) return null;

    problem.stats.totalSubmissions += 1;
    if (isAccepted) {
      problem.stats.acceptedSubmissions += 1;
    }

    return await problem.save();
  }

  // Get code template for specific language
  async getCodeTemplate(problemId, language) {
    const problem = await Problem.findById(problemId);
    if (!problem) return null;

    return problem.codeTemplates[language] || null;
  }

  // Search problems
  async searchProblems(searchTerm, limit = 10) {
    return await Problem.find({
      isActive: true,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    })
    .select('title slug difficulty tags')
    .limit(limit);
  }

  // Get problems by difficulty
  async getProblemsByDifficulty(difficulty) {
    return await Problem.find({
      isActive: true,
      difficulty
    })
    .select('title slug difficulty tags stats')
    .sort({ order: 1 });
  }

  // Get random problem
  async getRandomProblem(difficulty = null) {
    const query = { isActive: true };
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const count = await Problem.countDocuments(query);
    const random = Math.floor(Math.random() * count);
    
    return await Problem.findOne(query).skip(random);
  }
}

module.exports = new ProblemService();