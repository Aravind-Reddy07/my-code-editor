const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return errorResponse(res, 'No token provided, authorization denied', 401);
    }

    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Invalid token format', 401);
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return errorResponse(res, 'No token provided, authorization denied', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    
    errorResponse(res, 'Token verification failed', 401);
  }
};

module.exports = auth;