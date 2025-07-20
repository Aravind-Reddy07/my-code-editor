const { body, param, query } = require('express-validator');

// Common validation rules
const validationRules = {
  // User validation
  username: body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  email: body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  // Problem validation
  problemTitle: body('title')
    .notEmpty()
    .withMessage('Problem title is required')
    .isLength({ max: 200 })
    .withMessage('Problem title must not exceed 200 characters'),

  difficulty: body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),

  // Code validation
  code: body('code')
    .notEmpty()
    .withMessage('Code is required')
    .isLength({ max: 50000 })
    .withMessage('Code must not exceed 50,000 characters'),

  language: body('language')
    .isIn(['javascript', 'python', 'typescript', 'java', 'cpp'])
    .withMessage('Invalid programming language'),

  // MongoDB ObjectId validation
  mongoId: (field) => param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),

  // Pagination validation
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]
};

// Validation rule sets for different endpoints
const validationSets = {
  register: [
    validationRules.username,
    validationRules.email,
    validationRules.password
  ],

  login: [
    validationRules.email,
    body('password').notEmpty().withMessage('Password is required')
  ],

  createProblem: [
    validationRules.problemTitle,
    validationRules.difficulty,
    body('description').notEmpty().withMessage('Problem description is required'),
    body('examples').isArray().withMessage('Examples must be an array'),
    body('testCases').isObject().withMessage('Test cases must be an object')
  ],

  submitCode: [
    body('problemId').isMongoId().withMessage('Invalid problem ID'),
    validationRules.code,
    validationRules.language
  ]
};

module.exports = {
  validationRules,
  validationSets
};