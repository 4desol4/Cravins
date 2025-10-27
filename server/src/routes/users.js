const express = require('express');
const router = express.Router();
const { 
  getDashboard, 
  uploadAvatar, 
  getAchievements, 
  getNotifications 
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// All routes require authentication
router.use(authenticateToken);

router.get('/dashboard', getDashboard);
router.post('/avatar', uploadImage.single('avatar'), uploadAvatar);
router.get('/achievements', getAchievements);
router.get('/notifications', getNotifications);

module.exports = router;

