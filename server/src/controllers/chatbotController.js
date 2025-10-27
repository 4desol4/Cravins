const { processChatMessage, getUserChatSessions } = require('../services/openaiService');
const { apiResponse } = require('../utils/helpers');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Send message to chatbot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    const result = await processChatMessage(userId, message, sessionId);

    res.json(
      apiResponse(true, 'Message sent successfully', result)
    );
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json(
      apiResponse(false, error.message || ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

/**
 * Get user's chat sessions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getChatSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await getUserChatSessions(userId);

    res.json(
      apiResponse(true, 'Chat sessions retrieved successfully', sessions)
    );
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

/**
 * Get chat session messages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getChatMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const prisma = require('../config/database');
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chatSession) {
      return res.status(404).json(
        apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND)
      );
    }

    res.json(
      apiResponse(true, 'Chat messages retrieved successfully', chatSession.messages)
    );
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

/**
 * Delete chat session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const prisma = require('../config/database');
    
    // Soft delete by setting isActive to false
    const updatedSession = await prisma.chatSession.updateMany({
      where: {
        id: sessionId,
        userId,
      },
      data: {
        isActive: false,
      },
    });

    if (updatedSession.count === 0) {
      return res.status(404).json(
        apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND)
      );
    }

    res.json(
      apiResponse(true, 'Chat session deleted successfully')
    );
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

module.exports = {
  sendMessage,
  getChatSessions,
  getChatMessages,
  deleteChatSession,
};

