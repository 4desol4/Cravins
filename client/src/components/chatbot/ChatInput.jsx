import { useState } from "react";
import { motion } from "framer-motion";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

const ChatInput = ({
  onSendMessage,
  disabled = false,
  placeholder = "Ask me anything...",
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const suggestedQuestions = [
    "Explain quadratic equations",
    "What is photosynthesis?",
    "Help with English grammar",
    "Mathematics study tips",
  ];

  return (
    <div className="space-y-2 lg:space-y-4 w-full">
      {/* Suggested Questions */}
      {message === "" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex overflow-x-auto gap-2 px-1 lg:px-0 py-1"
        >
          {suggestedQuestions.map((question, index) => (
            <motion.button
              key={question}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setMessage(question)}
              className="flex-shrink-0 px-3 py-1.5 lg:px-4 lg:py-2 bg-gray-700 dark:bg-charcoal-800 dark:text-gray-200 text-gray-300 rounded-full text-xs lg:text-sm hover:bg-gray-600 transition-colors whitespace-nowrap"
            >
              {question}
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* Input Container */}
      <div className="flex items-end gap-2 w-full">
        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 resize-none rounded-2xl dark:bg-charcoal-900 bg-white dark:text-white text-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-sm lg:text-base px-4 py-2.5 lg:py-3 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-36 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#4B5563 #1F2937",
          }}
        />

        {/* Send Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          className={`flex-shrink-0 p-2.5 lg:p-3 rounded-full transition-all ${
            message.trim() && !disabled
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl hover:from-primary-600 hover:to-primary-700"
              : "bg-primary-700 text-gray-200 cursor-not-allowed"
          }`}
        >
          {disabled ? (
            <div className="w-4 lg:w-5 h-4 lg:h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <PaperAirplaneIcon className="w-4 lg:w-5 h-4 lg:h-5" />
          )}
        </motion.button>
      </div>

      {/* Character Counter */}
      {message.length > 800 && (
        <div
          className={`text-xs mt-1 text-right ${
            message.length > 950 ? "text-red-400" : "text-gray-400"
          }`}
        >
          {message.length}/1000
        </div>
      )}
    </div>
  );
};

export default ChatInput;
