import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ShareIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const TestResults = ({
  testResult,
  questions = [],
  onRetakeTest,
  onDownloadPDF,
  loading = false,
}) => {
  const { user } = useAuth();
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (loading || !testResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Calculating results...
          </p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success-600 dark:text-success-400";
    if (score >= 60) return "text-warning-600 dark:text-warning-400";
    return "text-error-600 dark:text-error-400";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80)
      return "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800";
    if (score >= 60)
      return "bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800";
    return "bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800";
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90)
      return { title: "Excellent! 🎉", message: "Outstanding performance!" };
    if (score >= 80)
      return { title: "Great Job! 🎊", message: "You did very well!" };
    if (score >= 70)
      return { title: "Good Work! 👍", message: "Solid performance!" };
    if (score >= 60)
      return { title: "Not Bad! 💪", message: "Keep practicing!" };
    return { title: "Keep Learning! 📚", message: "Practice makes perfect!" };
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleDownloadPDF = async () => {
    // Check if user has paid access
    const hasPaidAccess = user?.role === "ADMIN" || user?.hasPaid;

    if (!hasPaidAccess) {
      toast.error("Payment required to download PDFs");
      return;
    }

    setDownloading(true);
    try {
      await onDownloadPDF();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  const performance = getPerformanceMessage(testResult.score);

  // Check if user can download PDF
  const canDownloadPDF = user?.role === "ADMIN" || user?.hasPaid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-charcoal-900 dark:to-charcoal-800 py-6 sm:py-8 px-4">
      <div className="container-max section-padding max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mb-4 shadow-xl">
            <TrophyIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {performance.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            {performance.message}
          </p>
        </motion.div>

        {/* Main Results Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`bg-white dark:bg-charcoal-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 border-2 ${getScoreBgColor(
            testResult.score
          )}`}
        >
          <div className="text-center mb-6 sm:mb-8">
            <div
              className={`text-5xl sm:text-6xl font-bold ${getScoreColor(
                testResult.score
              )} mb-2`}
            >
              {Math.round(testResult.score)}%
            </div>
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
              Your Final Score
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {testResult.correctAnswers}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Correct
              </div>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-error-600 dark:text-error-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {testResult.totalQuestions - testResult.correctAnswers}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Wrong
              </div>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {testResult.totalQuestions}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Total
              </div>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(testResult.timeSpent || 0)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Time
              </div>
            </div>
          </div>

          {/* Subject Performance */}
          {testResult.subjectScores &&
            Object.keys(testResult.subjectScores).length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Subject Performance
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(testResult.subjectScores).map(
                    ([subject, score]) => (
                      <div
                        key={subject}
                        className="bg-white dark:bg-charcoal-700 p-4 rounded-lg border border-gray-200 dark:border-charcoal-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate pr-2">
                            {subject}
                          </h4>
                          <span
                            className={`font-bold text-sm sm:text-base ${getScoreColor(
                              score
                            )}`}
                          >
                            {Math.round(score)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-charcoal-600 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-2 rounded-full ${
                              score >= 70
                                ? "bg-success-500"
                                : score >= 50
                                ? "bg-warning-500"
                                : "bg-error-500"
                            }`}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            <button
              onClick={onRetakeTest}
              className="btn btn-primary w-full sm:w-auto text-sm sm:text-base"
            >
              <ArrowPathIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Retake Test
            </button>

            <button
              onClick={() => setShowDetailedResults(!showDetailedResults)}
              className="btn btn-outline w-full sm:w-auto text-sm sm:text-base"
            >
              <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {showDetailedResults ? "Hide" : "View"} Details
            </button>

            {canDownloadPDF && (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="btn btn-secondary w-full sm:w-auto text-sm sm:text-base"
              >
                {downloading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                )}
                Download PDF
              </button>
            )}

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: "My Test Results",
                      text: `I scored ${Math.round(
                        testResult.score
                      )}% on my practice test!`,
                      url: window.location.href,
                    })
                    .catch(() => {});
                } else {
                  navigator.clipboard.writeText(
                    `I scored ${Math.round(
                      testResult.score
                    )}% on my practice test!`
                  );
                  toast.success("Results copied to clipboard!");
                }
              }}
              className="btn btn-ghost w-full sm:w-auto text-sm sm:text-base"
            >
              <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Share
            </button>
          </div>

          {/* Payment Required Banner */}
          {!canDownloadPDF && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg text-center"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                Get Full Access
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
                Download test results as PDF and unlock all features
              </p>
              <Link
                to="/payments"
                className="btn btn-primary btn-sm text-xs sm:text-sm"
              >
                View Plans
              </Link>
            </motion.div>
          )}
        </motion.div>

        {/* Detailed Results */}
        {showDetailedResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-charcoal-800 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Detailed Analysis
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {questions.map((question, index) => {
                const isCorrect = question.isCorrect;
                const userAnswer = question.userAnswer;
                const correctAnswer = question.correctAnswer;

                return (
                  <motion.div
                    key={question.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 ${
                      isCorrect
                        ? "bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800"
                        : "bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap gap-2">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                            isCorrect
                              ? "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300"
                              : "bg-error-100 dark:bg-error-900/30 text-error-700 dark:text-error-300"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                          {question.subject && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                              {question.subject}
                            </span>
                          )}
                          {question.topic && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                              {question.topic}
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className={`flex items-center space-x-1 ${
                          isCorrect
                            ? "text-success-600 dark:text-success-400"
                            : "text-error-600 dark:text-error-400"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                        <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 leading-relaxed">
                      {question.text}
                    </h3>

                    <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-4">
                      {question.options.map((option, optionIndex) => {
                        const isUserAnswer = userAnswer === optionIndex;
                        const isCorrectOption = correctAnswer === optionIndex;

                        return (
                          <div
                            key={optionIndex}
                            className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
                              isCorrectOption
                                ? "bg-success-100 dark:bg-success-900/20 border-success-300 dark:border-success-700"
                                : isUserAnswer && !isCorrect
                                ? "bg-error-100 dark:bg-error-900/20 border-error-300 dark:border-error-700 text-gray-800 dark:text-white"
                                : "bg-white dark:bg-charcoal-700 border-gray-200 dark:border-charcoal-600 text-gray-800 dark:text-white"
                            }`}
                          >
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <span
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0 ${
                                  isCorrectOption
                                    ? "bg-success-500 text-gray-800 dark:text-white"
                                    : isUserAnswer && !isCorrect
                                    ? "bg-error-500 text-gray-800 dark:text-white"
                                    : "bg-gray-200 dark:bg-charcoal-600 text-gray-600 dark:text-gray-400"
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="text-xs sm:text-sm flex-1">
                                {option}
                              </span>
                              {isCorrectOption && (
                                <span className="text-xs bg-success-500 text-white px-2 py-1 rounded-full flex-shrink-0">
                                  Correct
                                </span>
                              )}
                              {isUserAnswer && !isCorrectOption && (
                                <span className="text-xs bg-error-500 text-white px-2 py-1 rounded-full flex-shrink-0">
                                  Your Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm sm:text-base">
                          Explanation:
                        </h4>
                        <p className="text-blue-800 dark:text-blue-200 text-xs sm:text-sm leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TestResults;