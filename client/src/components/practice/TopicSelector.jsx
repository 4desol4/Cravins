import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  BookOpenIcon,
  ChevronDownIcon,
  SparklesIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon as CheckIconSolid } from "@heroicons/react/24/solid";

const TopicSelector = ({
  subjects = [],
  selectedSubjects = [],
  selectedTopics = {},
  onTopicChange,
  topicsBySubject = {},
  loading = false,
  onLoadMoreTopics,
}) => {
  const [expandedSubjects, setExpandedSubjects] = useState({});
  const [loadingMore, setLoadingMore] = useState({});

  const toggleSubjectExpansion = (subjectId) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  const handleTopicToggle = (subjectId, topicId) => {
    const currentTopics = selectedTopics[subjectId] || [];
    const isSelected = currentTopics.includes(topicId);

    onTopicChange({
      ...selectedTopics,
      [subjectId]: isSelected
        ? currentTopics.filter((id) => id !== topicId)
        : [...currentTopics, topicId],
    });
  };

  const selectAllTopics = (subjectId) => {
    const subjectTopics = topicsBySubject[subjectId]?.topics || [];
    const allIds = subjectTopics.map((t) => t.id);
    const currentTopics = selectedTopics[subjectId] || [];
    const allSelected = allIds.every((id) => currentTopics.includes(id));

    onTopicChange({
      ...selectedTopics,
      [subjectId]: allSelected ? [] : allIds,
    });
  };

  const handleLoadMore = async (subjectId) => {
    setLoadingMore((prev) => ({ ...prev, [subjectId]: true }));
    try {
      await onLoadMoreTopics(subjectId);
    } finally {
      setLoadingMore((prev) => ({ ...prev, [subjectId]: false }));
    }
  };

  if (loading && Object.keys(topicsBySubject).length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white dark:bg-charcoal-800 rounded-2xl p-4 sm:p-6 shadow-lg"
          >
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-charcoal-700 rounded-lg mb-4 w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, j) => (
                <div
                  key={j}
                  className="h-10 sm:h-12 bg-gray-200 dark:bg-charcoal-700 rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (selectedSubjects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-charcoal-800 dark:to-charcoal-700 rounded-2xl p-8 sm:p-12 text-center border-2 border-dashed border-blue-300 dark:border-charcoal-600"
      >
        <BookOpenIcon className="w-12 h-12 sm:w-16 sm:h-16 text-blue-400 dark:text-blue-500 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
          Select Subjects First
        </h3>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Choose at least one subject to see available topics
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6"
    >
      {selectedSubjects.map((subjectId, index) => {
        const subject = subjects.find((s) => s.id === subjectId);
        const subjectData = topicsBySubject[subjectId];
        const topics = subjectData?.topics || [];
        const pagination = subjectData?.pagination || {};
        const selectedSubjectTopics = selectedTopics[subjectId] || [];
        const isExpanded = expandedSubjects[subjectId];
        const allTopicsSelected =
          topics.length > 0 &&
          topics.every((topic) => selectedSubjectTopics.includes(topic.id));

        if (!subject) return null;

        return (
          <motion.div
            key={subjectId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 dark:border-charcoal-700 hover:border-blue-300 dark:hover:border-charcoal-600 transition-all"
          >
            {/* Subject Header */}
            <button
              onClick={() => toggleSubjectExpansion(subjectId)}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-charcoal-700 dark:hover:to-charcoal-700 transition-all group"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow flex-shrink-0">
                  <BookOpenIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="text-left min-w-0 flex-1">
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {subject.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mt-1 gap-1">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {topics.length} topics available
                    </span>
                    {pagination.totalTopics > topics.length && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium inline-block w-fit">
                        {pagination.totalTopics - topics.length} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 ml-2">
                {topics.length > 0 && (
                  <div className="text-right hidden sm:block">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedSubjectTopics.length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      selected
                    </div>
                  </div>
                )}
                <ChevronDownIcon
                  className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {/* Topics List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t-2 border-gray-100 dark:border-charcoal-700"
                >
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-charcoal-900 dark:to-charcoal-800">
                    {/* Info Banner */}
                    <div className="flex items-start space-x-3 p-3 sm:p-4 bg-blue-100 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                        <p className="font-medium mb-1">
                          Topic Selection Guide
                        </p>
                        <p className="text-blue-700 dark:text-blue-300">
                          Select specific topics or leave empty for random
                          questions. Max 70 topics per subject.
                        </p>
                      </div>
                    </div>

                    {topics.length > 0 ? (
                      <>
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <button
                            onClick={() => selectAllTopics(subjectId)}
                            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-charcoal-700 border-2 border-blue-500 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded-xl font-medium hover:bg-blue-50 dark:hover:bg-charcoal-600 transition-all shadow-sm hover:shadow-md text-sm"
                          >
                            {allTopicsSelected ? (
                              <>
                                <CheckIconSolid className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Deselect All</span>
                              </>
                            ) : (
                              <>
                                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Select All</span>
                              </>
                            )}
                          </button>

                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-right">
                            {selectedSubjectTopics.length === 0 ? (
                              <span className="text-purple-600 dark:text-purple-400 font-medium">
                                All topics included (random)
                              </span>
                            ) : (
                              <span>
                                {selectedSubjectTopics.length} of{" "}
                                {topics.length} selected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Topics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                          {topics.map((topic, idx) => {
                            const isSelected = selectedSubjectTopics.includes(
                              topic.id
                            );
                            return (
                              <motion.button
                                key={topic.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.02 }}
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() =>
                                  handleTopicToggle(subjectId, topic.id)
                                }
                                className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all text-left shadow-sm hover:shadow-lg ${
                                  isSelected
                                    ? "border-blue-500 dark:border-blue-600 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-md"
                                    : "border-gray-200 dark:border-charcoal-600 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-charcoal-700"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span
                                    className={`text-xs sm:text-sm font-medium leading-snug flex-1 ${
                                      isSelected
                                        ? "text-blue-900 dark:text-blue-100"
                                        : "text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {topic.name}
                                  </span>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                                    >
                                      <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    </motion.div>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Load More Button - Show if less than 70 topics total */}
                        {pagination.totalTopics < 70 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center pt-4"
                          >
                            <button
                              onClick={() => handleLoadMore(subjectId)}
                              disabled={loadingMore[subjectId]}
                              className="inline-flex items-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                            >
                              {loadingMore[subjectId] ? (
                                <>
                                  <ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                <>
                                  <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                  <span>Load 14 More Topics</span>
                                </>
                              )}
                            </button>
                            <div className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">
                                {topics.length}
                              </span>{" "}
                              of{" "}
                              <span className="font-medium">
                                {pagination.totalTopics}
                              </span>{" "}
                              loaded
                              <span className="mx-2">•</span>
                              <span className="font-medium">
                                {70 - pagination.totalTopics}
                              </span>{" "}
                              more available
                            </div>
                          </motion.div>
                        )}

                        {/* Maximum Reached Message */}
                        {pagination.totalTopics >= 70 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center pt-4"
                          >
                            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-xl">
                              <CheckIconSolid className="w-5 h-5" />
                              <span className="font-medium text-sm">
                                All 70 topics loaded (Nigerian Curriculum
                                Complete)
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <SparklesIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                          Topics Coming Soon
                        </h4>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">
                          Topics are being generated for this subject
                        </p>
                        <div className="inline-flex items-center space-x-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                          <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                          <span>Generating topics...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default TopicSelector;
