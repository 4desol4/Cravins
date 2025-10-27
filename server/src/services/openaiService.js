const { chatWithBot } = require('../config/openai');
const prisma = require('../config/database');

/**
 * Process chat message with context
 * @param {string} userId - User ID
 * @param {string} message - User message
 * @param {string} sessionId - Chat session ID
 * @returns {Promise<Object>}
 */
const processChatMessage = async (userId, message, sessionId) => {
  try {
    // Get or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 10, // Last 10 messages for context
          },
        },
      });
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          userId,
          title: message.substring(0, 50),
        },
        include: {
          messages: true,
        },
      });
    }

    // Prepare chat history
    const history = chatSession.messages.map(msg => ({
      role: msg.role.toLowerCase(),
      content: msg.content,
    }));

    // Get response from OpenAI
    const botResponse = await chatWithBot(message, history);

    // Save user message
    await prisma.chatMessage.create({
      data: {
        chatSessionId: chatSession.id,
        role: 'USER',
        content: message,
      },
    });

    // Save bot response
    await prisma.chatMessage.create({
      data: {
        chatSessionId: chatSession.id,
        role: 'ASSISTANT',
        content: botResponse,
      },
    });

    return {
      response: botResponse,
      sessionId: chatSession.id,
    };
  } catch (error) {
    throw new Error(`Chat processing failed: ${error.message}`);
  }
};

/**
 * Get user's chat sessions
 * @param {string} userId - User ID
 * @returns {Promise<Object[]>}
 */
const getUserChatSessions = async (userId) => {
  try {
    const sessions = await prisma.chatSession.findMany({
      where: { 
        userId,
        isActive: true,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return sessions.map(session => ({
      id: session.id,
      title: session.title,
      lastMessage: session.messages[0]?.content || '',
      updatedAt: session.updatedAt,
    }));
  } catch (error) {
    throw new Error(`Failed to get chat sessions: ${error.message}`);
  }
};

module.exports = {
  processChatMessage,
  getUserChatSessions,
};

