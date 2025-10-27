const express = require('express');
const router = express.Router();
const { 
  sendMessage, 
  getChatSessions, 
  getChatMessages, 
  deleteChatSession 
} = require('../controllers/chatbotController');
const { authenticateToken } = require('../middleware/auth');
const { validateChatMessage } = require('../utils/validators');

// All routes require authentication
router.use(authenticateToken);

router.post('/message', validateChatMessage, sendMessage);
router.get('/sessions', getChatSessions);
router.get('/sessions/:sessionId/messages', getChatMessages);
router.delete('/sessions/:sessionId', deleteChatSession);

module.exports = router;

