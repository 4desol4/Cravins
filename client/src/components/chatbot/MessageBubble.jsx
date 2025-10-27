import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserIcon, SparklesIcon } from "@heroicons/react/24/outline";

// Typing Animation Component
const TypingText = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 15); // Speed of typing (lower = faster)
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      setTimeout(onComplete, 100);
    }
  }, [currentIndex, text, onComplete]);

  return (
    <div className="whitespace-pre-wrap break-words">
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-4 bg-primary-500 dark:bg-primary-400 animate-pulse ml-0.5" />
      )}
    </div>
  );
};

const MessageBubble = ({
  message,
  isBot = false,
  isTyping = false,
  timestamp,
}) => {
  const [showTyping, setShowTyping] = useState(
    isBot && message && !message.displayed
  );
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    if (isBot && message && message.displayed === false) {
      setShowTyping(true);
      setTypingComplete(false);
    }
  }, [isBot, message]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMessage = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">$1</code>'
      )
      .replace(/\n/g, "<br>");
  };

  const handleTypingComplete = () => {
    setShowTyping(false);
    setTypingComplete(true);
    if (message) {
      message.displayed = true;
    }
  };

  if (isTyping) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4"
      >
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-md">
          <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div className="flex-1 max-w-[85%] sm:max-w-xs lg:max-w-2xl">
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl rounded-tl-md px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
            Cravins Bot is thinking...
          </div>
        </div>
      </motion.div>
    );
  }

  const messageContent =
    typeof message === "string" ? message : message?.content || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4 ${
        !isBot ? "flex-row-reverse space-x-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md ${
          isBot
            ? "bg-gradient-to-r from-primary-500 to-secondary-500"
            : "bg-gradient-to-r from-secondary-600 to-secondary-700"
        }`}
      >
        {isBot ? (
          <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        ) : (
          <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={`flex-1 ${
          !isBot ? "max-w-[85%] sm:max-w-xs" : "max-w-[85%] sm:max-w-2xl"
        }`}
      >
        <div
          className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
            isBot
              ? "bg-white dark:bg-charcoal-800 text-gray-900 dark:text-gray-100 rounded-tl-md shadow-sm"
              : "bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-tr-md shadow-md"
          }`}
        >
          {showTyping && !typingComplete && messageContent ? (
            <div className="text-sm sm:text-base leading-relaxed">
              <TypingText
                text={messageContent}
                onComplete={handleTypingComplete}
              />
            </div>
          ) : (
            <div
              className="text-sm sm:text-base leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: formatMessage(messageContent),
              }}
            />
          )}
        </div>

        {timestamp && (
          <div
            className={`text-xs text-gray-500 dark:text-gray-400 mt-1 px-2 ${
              !isBot ? "text-right" : "text-left"
            }`}
          >
            {formatTimestamp(timestamp)}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
