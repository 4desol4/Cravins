const express = require('express');
const router = express.Router();
const { 
  getVideos, 
  getVideo, 
  uploadVideo, 
  addYouTubeVideo, 
  updateVideo, 
  deleteVideo 
} = require('../controllers/videoController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { uploadVideo: uploadVideoMiddleware } = require('../middleware/upload');
const { validateVideo, handleValidationErrors } = require('../middleware/validation');

// Public routes
router.get('/', optionalAuth, getVideos);
router.get('/:videoId', optionalAuth, getVideo);

// Admin routes
router.post('/upload', authenticateToken, requireAdmin, uploadVideoMiddleware.single('video'), uploadVideo);
router.post('/youtube', authenticateToken, requireAdmin, validateVideo, addYouTubeVideo);
router.put('/:videoId', authenticateToken, requireAdmin, updateVideo);
router.delete('/:videoId', authenticateToken, requireAdmin, deleteVideo);

module.exports = router;

