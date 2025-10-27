import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
  BookmarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  FlagIcon as FlagIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from "@heroicons/react/24/solid";

const QuestionContainer = ({
  questions = [],
  currentQuestionIndex = 0,
  answers = {},
  onAnswerSelect,
  onNavigate,
  onFlag,
  onBookmark,
  flaggedQuestions = [],
  bookmarkedQuestions = [],
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    setSelectedAnswer(
      answers[currentQuestionIndex] !== undefined
        ? answers[currentQuestionIndex]
        : null
    );
  }, [currentQuestionIndex, answers]);

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
    onAnswerSelect(currentQuestionIndex, optionIndex);
  };

  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFlagged = flaggedQuestions.includes(currentQuestionIndex);
  const isBookmarked = bookmarkedQuestions.includes(currentQuestionIndex);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-charcoal-700 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading question...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-charcoal-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-charcoal-700"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 flex-1">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 text-white rounded-xl flex items-center justify-center text-lg font-bold shadow-lg"
            >
              {currentQuestionIndex + 1}
            </motion.div>

            <div className="flex items-center flex-wrap gap-2">
              {currentQuestion.subject && (
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">
                  {currentQuestion.subject}
                </span>
              )}

              {currentQuestion.topic && (
                <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800">
                  {currentQuestion.topic}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onFlag(currentQuestionIndex)}
              className={`p-2.5 rounded-xl transition-all ${
                isFlagged
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-lg"
                  : "bg-gray-100 dark:bg-charcoal-700 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
              }`}
              title="Flag question"
            >
              {isFlagged ? (
                <FlagIconSolid className="w-5 h-5" />
              ) : (
                <FlagIcon className="w-5 h-5" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onBookmark(currentQuestionIndex)}
              className={`p-2.5 rounded-xl transition-all ${
                isBookmarked
                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 shadow-lg"
                  : "bg-gray-100 dark:bg-charcoal-700 text-gray-400 dark:text-gray-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600"
              }`}
              title="Bookmark question"
            >
              {isBookmarked ? (
                <BookmarkIconSolid className="w-5 h-5" />
              ) : (
                <BookmarkIcon className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        <div className="space-y-3 mb-8">
          {currentQuestion.options?.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleAnswerSelect(index)}
              className={`w-full p-5 text-left rounded-2xl border-2 transition-all ${
                selectedAnswer === index
                  ? "border-primary-500 dark:border-primary-400 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 shadow-xl"
                  : "border-gray-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{
                    scale: selectedAnswer === index ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    selectedAnswer === index
                      ? "border-primary-500 dark:border-primary-400 bg-gradient-to-br from-primary-500 to-secondary-600 text-white shadow-lg"
                      : "border-gray-300 dark:border-charcoal-500 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-charcoal-600"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </motion.div>

                <span
                  className={`flex-1 text-base ${
                    selectedAnswer === index
                      ? "text-primary-900 dark:text-primary-100 font-semibold"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option}
                </span>

                <AnimatePresence>
                  {selectedAnswer === index && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
                    >
                      <CheckCircleIconSolid className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-charcoal-600">
          <motion.button
            whileHover={!isFirstQuestion ? { scale: 1.05, x: -4 } : {}}
            whileTap={!isFirstQuestion ? { scale: 0.95 } : {}}
            onClick={() => onNavigate(currentQuestionIndex - 1)}
            disabled={isFirstQuestion}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isFirstQuestion
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-700 hover:text-primary-600 dark:hover:text-primary-400"
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Previous</span>
          </motion.button>

          <div className="flex items-center space-x-3 px-6 py-2 bg-gray-50 dark:bg-charcoal-700 rounded-xl">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {Object.keys(answers).length} / {questions.length} answered
            </span>
            {selectedAnswer !== null && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
            )}
          </div>

          <motion.button
            whileHover={!isLastQuestion ? { scale: 1.05, x: 4 } : {}}
            whileTap={!isLastQuestion ? { scale: 0.95 } : {}}
            onClick={() => onNavigate(currentQuestionIndex + 1)}
            disabled={isLastQuestion}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              isLastQuestion
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-700 hover:text-primary-600 dark:hover:text-primary-400"
            }`}
          >
            <span>Next</span>
            <ChevronRightIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-charcoal-800 rounded-3xl shadow-2xl p-6 border border-gray-100 dark:border-charcoal-700"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
            Question Navigator
          </h4>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 dark:bg-charcoal-600 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Unanswered
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 lg:grid-cols-20 gap-2">
          {questions.map((_, index) => {
            const isAnswered = answers[index] !== undefined;
            const isCurrent = index === currentQuestionIndex;
            const isFlaggedQ = flaggedQuestions.includes(index);

            return (
              <motion.button
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate(index)}
                className={`relative w-10 h-10 text-sm font-bold rounded-xl transition-all ${
                  isCurrent
                    ? "bg-gradient-to-br from-primary-500 to-secondary-600 text-white shadow-lg ring-2 ring-primary-300 dark:ring-primary-700"
                    : isAnswered
                    ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md hover:shadow-lg"
                    : "bg-gray-200 dark:bg-charcoal-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-charcoal-500"
                }`}
                title={`Question ${index + 1}${
                  isAnswered ? " (Answered)" : ""
                }${isFlaggedQ ? " (Flagged)" : ""}`}
              >
                {index + 1}
                {isFlaggedQ && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-charcoal-800"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default QuestionContainer;
