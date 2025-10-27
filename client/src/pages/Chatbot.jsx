import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ClockIcon,
  SparklesIcon,
  LightBulbIcon,
  BookOpenIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import ChatInterface from "../components/chatbot/ChatInterface";
import { chatbotAPI } from "../services/api";
import toast from "react-hot-toast";

const Chatbot = () => {
  const { user } = useAuth();
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchChatSessions();

    // Auto-show sidebar on desktop
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchChatSessions = async () => {
    try {
      setLoading(true);
      const response = await chatbotAPI.getChatSessions();
      setChatSessions(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch chat sessions:", error);
      toast.error("Failed to load chat history");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = (sessionId) => {
    if (sessionId && !chatSessions.find((s) => s.id === sessionId)) {
      fetchChatSessions();
    }
    setCurrentSessionId(sessionId);
  };

  const handleSelectSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this chat session?")) {
      return;
    }

    try {
      await chatbotAPI.deleteChatSession(sessionId);
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));

      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }

      toast.success("Chat session deleted");
    } catch (error) {
      console.error("Delete session error:", error);
      toast.error("Failed to delete session");
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  const studyTopics = [
    {
      title: "Mathematics",
      icon: "🔢",
      description: "Algebra, Calculus, Geometry, Statistics",
      color:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
    },
    {
      title: "Sciences",
      icon: "🧪",
      description: "Physics, Chemistry, Biology",
      color:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
    },
    {
      title: "English",
      icon: "📚",
      description: "Grammar, Literature, Writing, Comprehension",
      color:
        "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
    },
    {
      title: "Study Skills",
      icon: "🎯",
      description: "Time management, Note-taking, Exam prep",
      color:
        "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
    },
  ];

  const formatSessionTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      
      {/* Mobile overlay */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex h-screen relative">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed lg:relative w-72 sm:w-80 h-full bg-white dark:bg-charcoal-900 border-r border-gray-200 dark:border-charcoal-800 flex flex-col z-50 lg:z-auto shadow-xl lg:shadow-none"
            >
              {/* Sidebar Header */}
              <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-charcoal-800 flex-shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-md">
                      <ChatBubbleLeftRightIcon className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg lg:text-xl font-heading text-gray-900 dark:text-white">
                        Cravins Bot
                      </h1>
                      <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                        AI Study Companion
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <button
                  onClick={startNewChat}
                  className="w-full btn btn-primary flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>New Chat</span>
                </button>
              </div>

              {/* Chat Sessions */}
              <div className="flex-1 overflow-y-auto p-3 lg:p-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 px-1">
                    Recent Chats
                  </h3>

                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 dark:bg-charcoal-800 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : chatSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No chat history yet
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Start a new conversation
                      </p>
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <motion.button
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectSession(session.id)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          currentSessionId === session.id
                            ? "bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-500 shadow-sm"
                            : "bg-white dark:bg-charcoal-800 border-gray-200 dark:border-charcoal-700 hover:bg-gray-50 dark:hover:bg-charcoal-700 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {session.title || "Untitled Chat"}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {session.lastMessage || "No messages yet"}
                            </p>
                            <div className="flex items-center space-x-1 mt-2">
                              <ClockIcon className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatSessionTime(session.updatedAt)}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-charcoal-800 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-secondary-600 to-secondary-700 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-sm font-medium text-white">
                      {user?.firstName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with hamburger menu */}
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-900 flex items-center justify-between flex-shrink-0 shadow-sm">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-charcoal-800 rounded-lg lg:hidden transition-colors"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="hidden lg:inline-flex btn btn-outline btn-sm"
            >
              {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
            </button>

            <div className="lg:hidden text-sm font-medium text-gray-900 dark:text-white">
              Cravins Bot
            </div>

            <div className="w-6 lg:w-auto"></div>
          </div>

         
            <div className="flex-1 min-h-0" ref={chatContainerRef}>
              <ChatInterface
                sessionId={currentSessionId}
                onNewSession={handleNewSession}
              />
            </div>
          
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
