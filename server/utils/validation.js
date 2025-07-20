const { body, validationResult } = require('express-validator');

// Common validation rules
const validationRules = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  problemId: body('problemId')
    .isMongoId()
    .withMessage('Invalid problem ID'),
  
  code: body('code')
    .notEmpty()
    .withMessage('Code is required'),
  
  language: body('language')
    .isIn(['javascript', 'python', 'java', 'cpp', 'typescript'])
    .withMessage('Invalid programming language')
};

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = { validationRules, validate };