
const { body, param, query } = require('express-validator');

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (field) => {
  return param(field).isMongoId().withMessage(`Invalid ${field}`);
};

/**
 * Validate pagination parameters
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * Validate test configuration
 */
const validateTestConfig = [
  body('subjects')
    .isArray({ min: 1, max: 5 })
    .withMessage('Select 1-5 subjects'),
  body('subjects.*')
    .isMongoId()
    .withMessage('Invalid subject ID'),
  body('topics')
    .optional()
    .isArray()
    .withMessage('Topics must be an array'),
  body('topics.*')
    .isMongoId()
    .withMessage('Invalid topic ID'),
  body('difficulty')
    .isIn(['EASY', 'MEDIUM', 'HARD'])
    .withMessage('Invalid difficulty level'),
  body('totalQuestions')
    .isInt({ min: 1, max: 100 })
    .withMessage('Total questions must be between 1 and 100'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Duration must be between 1 and 300 minutes'),
];

/**
 * Validate test submission
 */
const validateTestSubmission = [
  body('testId')
    .optional()
    .isMongoId()
    .withMessage('Invalid test ID'),
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('answers.*.questionId')
    .isMongoId()
    .withMessage('Invalid question ID'),
  body('answers.*.userAnswer')
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage('User answer must be between 0 and 3'),
  body('answers.*.timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be non-negative'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total time spent must be non-negative'),
];

/**
 * Validate chat message
 */
const validateChatMessage = [
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('sessionId')
    .optional()
    .isMongoId()
    .withMessage('Invalid session ID'),
];

/**
 * Validate payment initialization
 */
const validatePaymentInit = [
  body('type')
    .isIn(['PREMIUM_SUBSCRIPTION', 'MATERIAL_PURCHASE'])
    .withMessage('Invalid payment type'),
  body('materialId')
    .if(body('type').equals('MATERIAL_PURCHASE'))
    .isMongoId()
    .withMessage('Material ID required for material purchase'),
  body('duration')
    .if(body('type').equals('PREMIUM_SUBSCRIPTION'))
    .optional()
    .isIn([1, 6, 12])
    .withMessage('Duration must be 1, 6, or 12 months'),
];

/**
 * Validate password strength
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  
  if (password.length < minLength) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!hasUpperCase) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!hasLowerCase) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!hasNumbers) {
    return 'Password must contain at least one number';
  }
  
  if (!hasNonalphas) {
    return 'Password must contain at least one special character';
  }
  
  return null; // Password is valid
};

/**
 * Validate file upload
 */
const validateFileUpload = (fileType) => {
  const validators = {
    image: [
      body().custom((value, { req }) => {
        if (!req.file) {
          throw new Error('Image file is required');
        }
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Only JPEG, PNG, GIF, and WebP images are allowed');
        }
        
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.file.size > maxSize) {
          throw new Error('Image size must be less than 5MB');
        }
        
        return true;
      }),
    ],
    video: [
      body().custom((value, { req }) => {
        if (!req.file) {
          throw new Error('Video file is required');
        }
        
        const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Only MP4, AVI, MOV, and WMV videos are allowed');
        }
        
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (req.file.size > maxSize) {
          throw new Error('Video size must be less than 100MB');
        }
        
        return true;
      }),
    ],
    document: [
      body().custom((value, { req }) => {
        if (!req.file) {
          throw new Error('Document file is required');
        }
        
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        
        if (!allowedTypes.includes(req.file.mimetype)) {
          throw new Error('Only PDF, DOC, DOCX, XLS, and XLSX files are allowed');
        }
        
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (req.file.size > maxSize) {
          throw new Error('Document size must be less than 50MB');
        }
        
        return true;
      }),
    ],
  };
  
  return validators[fileType] || [];
};

module.exports = {
  validateObjectId,
  validatePagination,
  validateTestConfig,
  validateTestSubmission,
  validateChatMessage,
  validatePaymentInit,
  validatePasswordStrength,
  validateFileUpload,
};

