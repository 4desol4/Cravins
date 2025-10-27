const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration
 * @returns {string}
 */
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object}
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string}
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate password reset token
 * @returns {string}
 */
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Paginate results
 * @param {Object} query - Prisma query object
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object}
 */
const paginate = (query, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  return {
    ...query,
    skip: offset,
    take: limit,
  };
};

/**
 * Format pagination response
 * @param {Array} data - Data array
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object}
 */
const formatPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      limit,
    },
  };
};

/**
 * Calculate reading time
 * @param {string} text - Text content
 * @returns {number} - Reading time in minutes
 */
const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Generate slug from text
 * @param {string} text - Text to slugify
 * @returns {string}
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Sanitize filename
 * @param {string} filename - Original filename
 * @returns {string}
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

/**
 * Get file extension
 * @param {string} filename - Filename
 * @returns {string}
 */
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Nigerian format)
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
const isValidNigerianPhone = (phone) => {
  const phoneRegex = /^(\+234|0)[789]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Remove sensitive data from user object
 * @param {Object} user - User object
 * @returns {Object}
 */
const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

/**
 * Generate API response
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata
 * @returns {Object}
 */
const apiResponse = (success, message, data = null, meta = null) => {
  const response = { success, message };
  
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  
  return response;
};

/**
 * Handle async errors
 * @param {Function} fn - Async function
 * @returns {Function}
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
  generateRandomString,
  generateResetToken,
  paginate,
  formatPaginationResponse,
  calculateReadingTime,
  generateSlug,
  formatFileSize,
  sanitizeFilename,
  getFileExtension,
  isValidEmail,
  isValidNigerianPhone,
  sanitizeUser,
  apiResponse,
  asyncHandler,
};

