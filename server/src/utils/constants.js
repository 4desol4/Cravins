const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

const DIFFICULTY_LEVELS = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
};

const PAYMENT_PLAN_TYPES = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  LIFETIME: 'LIFETIME',
};

const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

const MESSAGE_ROLES = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
};

const NEWS_SOURCES = {
  INTERNAL: 'INTERNAL',
  EXTERNAL: 'EXTERNAL',
};

const NIGERIAN_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Physics',
  'Chemistry',
  'Biology',
  'Further Mathematics',
  'Economics',
  'Geography',
  'Government',
  'Literature in English',
  'History',
  'Agricultural Science',
  'Computer Studies',
  'Commerce',
  'Accounting',
  'Business Studies',
];

// Default pricing (can be changed by admin)
const DEFAULT_PAYMENT_PRICING = {
  MONTHLY: 2000, // NGN 2000
  YEARLY: 18000, // NGN 18000
  LIFETIME: 50000, // NGN 50000
};

const FILE_TYPES = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  VIDEOS: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
};

const UPLOAD_LIMITS = {
  IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  DOCUMENT_SIZE: 50 * 1024 * 1024, // 50MB
};

const TEST_CONFIG = {
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 100,
  MIN_SUBJECTS: 1,
  MAX_SUBJECTS: 5,
  DEFAULT_DURATION: 60, // minutes
  QUESTIONS_PER_MINUTE: 1.5,
  DEFAULT_FREE_LIMIT: 5, // Free users can only answer 5 questions
};

const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests
  },
  AI: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 AI requests
  },
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  PAYMENT_REQUIRED: 'Payment required to access this feature',
  PAYMENT_DISABLED: 'Payments are currently disabled by admin',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  PAYMENT_FAILED: 'Payment processing failed',
  RESOURCE_NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  FREE_LIMIT_REACHED: 'You have reached the free question limit. Please upgrade to continue.',
  TEST_NOT_COMPLETE: 'Please complete your payment to submit this test',
};

const SUCCESS_MESSAGES = {
  USER_CREATED: 'Account created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_RESET_SENT: 'Password reset link sent to email',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  PAYMENT_SUCCESS: 'Payment processed successfully',
  ACCESS_ACTIVATED: 'Full access activated',
  TEST_SUBMITTED: 'Test submitted successfully',
  MESSAGE_SENT: 'Message sent successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
};

module.exports = {
  USER_ROLES,
  DIFFICULTY_LEVELS,
  PAYMENT_PLAN_TYPES,
  PAYMENT_STATUS,
  MESSAGE_ROLES,
  NEWS_SOURCES,
  NIGERIAN_SUBJECTS,
  DEFAULT_PAYMENT_PRICING,
  FILE_TYPES,
  UPLOAD_LIMITS,
  TEST_CONFIG,
  RATE_LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};