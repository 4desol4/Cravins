const express = require('express');
const router = express.Router();
const { 
  getSubjects, 
  getTopics,
  generateMoreTopics,
  startTest, 
  submitTest, 
  getTestHistory, 
  getTestResult, 
  downloadTestPDF, 
  getUserStats 
} = require('../controllers/practiceController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requirePaidAccess, checkPaidStatus } = require('../middleware/roleCheck');
const { 
  validateTestConfig, 
  validateTestSubmission, 
} = require('../utils/validators');
const { handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');


// Free or logged-in users can browse subjects
router.get('/subjects', optionalAuth, getSubjects);

// Get topics (authenticated)
router.post(
  '/topics',
  authenticateToken,
  [
    body('subjectIds').isArray({ min: 1 }).withMessage('Subject IDs are required'),
    body('subjectIds.*').isMongoId().withMessage('Invalid subject ID'),
    body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    body('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    handleValidationErrors,
  ],
  getTopics
);

// Generate more topics (authenticated)
router.post(
  '/topics/generate',
  authenticateToken,
  [
    body('subjectId').isMongoId().withMessage('Valid subject ID is required'),
    handleValidationErrors,
  ],
  generateMoreTopics
);


//  Start test — both free & paid users (free users limited by backend)
router.post('/start', authenticateToken, validateTestConfig, checkPaidStatus, startTest);

//  Submit test — paid only
router.post('/submit', authenticateToken, requirePaidAccess, validateTestSubmission, submitTest);

//  Get test history — authenticated
router.get('/history', authenticateToken, getTestHistory);

//  Get performance stats
router.get('/stats', authenticateToken, getUserStats);

// Get individual test result
router.get('/result/:testId', authenticateToken, getTestResult);

//  Download test PDF — paid users only
router.get('/download/:testId', authenticateToken, requirePaidAccess, downloadTestPDF);

module.exports = router;
