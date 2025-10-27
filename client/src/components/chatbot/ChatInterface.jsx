import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrashIcon,
  ShareIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { chatbotAPI } from "../../services/api";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import toast from "react-hot-toast";

const ChatInterface = ({ sessionId: initialSessionId, onNewSession }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Update sessionId when initialSessionId changes
  useEffect(() => {
    setSessionId(initialSessionId);
  }, [initialSessionId]);

  useEffect(() => {
    if (sessionId) {
      loadChatMessages();
    } else {
      // Show welcome message for new session
      setMessages([
        {
          id: "welcome",
          role: "ASSISTANT",
          content: `Hello ${
            user?.firstName || "there"
          }! 👋 I'm Cravins Bot, your AI study companion. What would you like to learn today?`,
          createdAt: new Date().toISOString(),
          displayed: true,
        },
      ]);
    }
    // Cleanup function to reset state when session changes
    return () => {
      setError(null);
      setIsTyping(false);
    };
  }, [sessionId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadChatMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await chatbotAPI.getChatMessages(sessionId);

      // Ensure response has data
      const messagesData = response?.data?.data || [];

      // Format and mark all loaded messages as displayed
      const loadedMessages = messagesData.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        displayed: true, // Mark all loaded messages as already displayed
      }));

      setMessages(loadedMessages);

      // Show success toast if messages were loaded
      if (loadedMessages.length > 0) {
        toast.success(`Loaded ${loadedMessages.length} messages`);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load chat history. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);

      // Set empty messages on error
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isTyping) return;

    // Add user message immediately
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "USER",
      content: messageText,
      createdAt: new Date().toISOString(),
      displayed: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const response = await chatbotAPI.sendMessage({
        message: messageText,
        sessionId,
      });

      const { response: botResponse, sessionId: newSessionId } =
        response.data.data;

      // Update session ID if it's a new session
      if (!sessionId && newSessionId) {
        setSessionId(newSessionId);
        onNewSession?.(newSessionId);
      }

      // Add bot response with typing animation
      const botMessage = {
        id: `bot-${Date.now()}`,
        role: "ASSISTANT",
        content: botResponse,
        createdAt: new Date().toISOString(),
        displayed: false, // This will trigger typing animation
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Send message error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Failed to send message. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);

      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "ASSISTANT",
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        createdAt: new Date().toISOString(),
        displayed: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    // Use toast for confirmation
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-gray-900 dark:text-white">
            Clear this chat?
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This will start a new conversation. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                setMessages([
                  {
                    id: "welcome",
                    role: "ASSISTANT",
                    content: `Hello ${
                      user?.firstName || "there"
                    }! 👋 I'm Cravins Bot, your AI study companion. What would you like to learn today?`,
                    createdAt: new Date().toISOString(),
                    displayed: true,
                  },
                ]);
                setSessionId(null);
                onNewSession?.(null);
                toast.success("Chat cleared successfully");
              }}
              className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          maxWidth: "400px",
        },
      }
    );
  };

  const handleShareChat = async () => {
    try {
      const chatText = messages
        .filter(
          (msg) =>
            (msg.id !== "welcome" && msg.role !== "ASSISTANT") || msg.content
        )
        .map(
          (msg) =>
            `${msg.role === "USER" ? "You" : "Cravins Bot"}: ${msg.content}`
        )
        .join("\n\n");

      if (!chatText.trim()) {
        toast.error("No messages to share");
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(chatText);
        toast.success("Chat copied to clipboard!");
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = chatText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast.success("Chat copied to clipboard!");
      }
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy chat. Please try again.");
    }
  };

  const handleBookmarkChat = () => {
    // Save chat to bookmarks (would be implemented with API)
    toast.success("Chat bookmarked (feature coming soon)");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 dark:bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 lg:p-4 border-b border-gray-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-heading text-sm lg:text-base">
              CB
            </span>
          </div>
          <div>
            <h3 className="font-heading text-gray-900 dark:text-white text-sm lg:text-base">
              Cravins Bot
            </h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
              {isTyping ? (
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Typing...
                </span>
              ) : (
                "AI Study Companion"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 lg:space-x-2">
          <button
            onClick={handleBookmarkChat}
            className="p-1.5 lg:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
            title="Bookmark chat"
          >
            <BookmarkIcon className="w-4 lg:w-5 h-4 lg:h-5" />
          </button>

          <button
            onClick={handleShareChat}
            className="p-1.5 lg:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
            title="Share chat"
          >
            <ShareIcon className="w-4 lg:w-5 h-4 lg:h-5" />
          </button>

          <button
            onClick={handleClearChat}
            className="p-1.5 lg:p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Clear chat"
          >
            <TrashIcon className="w-4 lg:w-5 h-4 lg:h-5" />
          </button>

          <button
            className="p-1.5 lg:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Cog6ToothIcon className="w-4 lg:w-5 h-4 lg:h-5" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900 px-4 py-3"
        >
          <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 lg:px-4 py-4 lg:py-6 bg-gray-50 dark:bg-black"
        style={{
          minHeight: 0,
          maxHeight: "calc(100vh - 280px)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isBot={message.role === "ASSISTANT"}
                timestamp={message.createdAt}
              />
            ))}

            {isTyping &&
              messages[messages.length - 1]?.role !== "ASSISTANT" && (
                <MessageBubble isBot={true} isTyping={true} />
              )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isTyping}
            placeholder="Ask Cravins Bot anything about your studies..."
          />
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="px-3 pb-3 lg:px-4 lg:pb-4 bg-white dark:bg-charcoal-900 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center gap-1 lg:gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">Quick:</span>
            {["Math help", "Study tips", "Exam prep"].map((action, idx) => (
              <button
                key={idx}
                onClick={() =>
                  handleSendMessage(`Help me with ${action.toLowerCase()}`)
                }
                disabled={isTyping}
                className="px-2 py-1 bg-gray-100 dark:bg-charcoal-800 rounded hover:bg-gray-200 dark:hover:bg-charcoal-700 transition-colors text-xs disabled:opacity-50"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
