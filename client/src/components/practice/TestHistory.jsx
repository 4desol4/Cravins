import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ClockIcon,
  TrophyIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { practiceAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { useDebounce } from "../../hooks/useDebounce";

const TestHistory = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterSubject, setFilterSubject] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchTestHistory();
  }, [page, debouncedSearchTerm, sortBy, filterSubject]);

  const fetchTestHistory = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: debouncedSearchTerm,
        sortBy,
        subject: filterSubject,
      };

      const response = await practiceAPI.getTestHistory(params);
      setTests(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch test history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success-600";
    if (score >= 60) return "text-warning-600";
    return "text-error-600";
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return "bg-success-100 text-success-700";
    if (score >= 60) return "bg-warning-100 text-warning-700";
    return "bg-error-100 text-error-700";
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleDownloadPDF = async (testId) => {
    if (!user?.isPremium && user?.role !== "ADMIN") {
      toast.error("Premium subscription required to download PDFs");
      return;
    }

    try {
      const response = await practiceAPI.downloadTestPDF(testId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `test-result-${testId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  if (loading && tests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading test history..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container-max section-padding">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Test History
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Review your past test performances and track your progress
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                <option value="recent">Most Recent</option>
                <option value="score_high">Highest Score</option>
                <option value="score_low">Lowest Score</option>
                <option value="duration">Longest Duration</option>
              </select>
            </div>

            {/* Filter by Subject */}
            <div className="flex items-center space-x-2">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="input"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English Language">English Language</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Test List */}
        {tests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-12 text-center"
          >
            <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Test History Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start taking practice tests to see your performance history here
            </p>
            <Link to="/practice" className="btn btn-primary">
              Take Your First Test
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {tests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {test.testName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(
                          test.score
                        )}`}
                      >
                        {Math.round(test.score)}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-1">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>
                          {new Date(test.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{formatTime(test.timeSpent)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChartBarIcon className="w-4 h-4" />
                        <span>
                          {test.correctAnswers}/{test.totalQuestions} correct
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {test.subjects.map((subject, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>

                    {/* Subject Scores */}
                    {test.subjectScores &&
                      Object.keys(test.subjectScores).length > 0 && (
                        <div className="mt-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(test.subjectScores)
                              .slice(0, 4)
                              .map(([subject, score]) => (
                                <div key={subject} className="text-center">
                                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {subject}
                                  </div>
                                  <div
                                    className={`text-lg font-bold ${getScoreColor(
                                      score
                                    )}`}
                                  >
                                    {Math.round(score)}%
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <Link
                      to={`/practice/result/${test.id}`}
                      className="btn btn-sm btn-outline flex items-center space-x-2"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>

                    {(user?.isPremium || user?.role === "ADMIN") && (
                      <button
                        onClick={() => handleDownloadPDF(test.id)}
                        className="btn btn-sm btn-ghost flex items-center space-x-2"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>Download PDF</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center space-x-2 mt-8"
          >
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="btn btn-outline btn-sm"
            >
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? "bg-primary-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="btn btn-outline btn-sm"
            >
              Next
            </button>
          </motion.div>
        )}

        {loading && (
          <div className="flex justify-center mt-8">
            <LoadingSpinner size="md" text="Loading more tests..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHistory;
