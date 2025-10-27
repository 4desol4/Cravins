// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  getProfile, 
  updateProfile, 
  changePassword 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
  validateSignup, 
  validateLogin, 
  handleValidationErrors 
} = require('../middleware/validation');
const { body } = require('express-validator');

// Public routes
router.post('/register', validateSignup, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  handleValidationErrors
], forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
], resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().isMobilePhone(),
  body('dateOfBirth').optional().isISO8601(),
  handleValidationErrors
], updateProfile);
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  handleValidationErrors
], changePassword);

module.exports = router;

