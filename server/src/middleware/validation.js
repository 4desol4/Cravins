const { body, validationResult } = require('express-validator');

/**
 * Handle validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// User validation rules
const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

// Subject validation rules
const validateSubject = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Subject name must be at least 2 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  handleValidationErrors,
];

// Topic validation rules
const validateTopic = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Topic name must be at least 2 characters'),
  body('subjectId')
    .isMongoId()
    .withMessage('Valid subject ID is required'),
  handleValidationErrors,
];

// Video validation rules
const validateVideo = [
  body('title')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Video title must be at least 2 characters'),
  body('url')
    .isURL()
    .withMessage('Valid URL is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  handleValidationErrors,
];

// Material validation rules
const validateMaterial = [
  body('title')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Material title must be at least 2 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  handleValidationErrors,
];

// News validation rules
const validateNews = [
  body('title')
    .trim()
    .isLength({ min: 5 })
    .withMessage('News title must be at least 5 characters'),
  body('content')
    .trim()
    .isLength({ min: 20 })
    .withMessage('News content must be at least 20 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Excerpt must not exceed 300 characters'),
  handleValidationErrors,
];

// Test validation rules
const validateTestStart = [
  body('subjects')
    .isArray({ min: 1, max: 5 })
    .withMessage('Select 1-5 subjects'),
  body('totalQuestions')
    .isInt({ min: 1, max: 100 })
    .withMessage('Total questions must be between 1 and 100'),
  body('difficulty')
    .isIn(['EASY', 'MEDIUM', 'HARD'])
    .withMessage('Invalid difficulty level'),
  handleValidationErrors,
];


module.exports = {
  handleValidationErrors,
  validateSignup,
  validateLogin,
  validateSubject,
  validateTopic,
  validateVideo,
  validateMaterial,
  validateNews,
  validateTestStart,
};