import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  LockClosedIcon,
  SparklesIcon,
  FireIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import { practiceAPI, paymentAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Modal from "../components/common/Modal";
import SubjectSelector from "../components/practice/SubjectSelector";
import TopicSelector from "../components/practice/TopicSelector";
import QuestionContainer from "../components/practice/QuestionContainer";
import Timer from "../components/practice/Timer";
import TestResults from "../components/practice/TestResults";
import toast from "react-hot-toast";

const Practice = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState("setup");
  const [loading, setLoading] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [accessStatus, setAccessStatus] = useState(null);

  // Setup state
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [topicsBySubject, setTopicsBySubject] = useState({});
  const [selectedTopics, setSelectedTopics] = useState({});
  const [useRandomTopics, setUseRandomTopics] = useState(false);
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [testDuration, setTestDuration] = useState(30);
  const [topicPages, setTopicPages] = useState({});
  const [topicsLoading, setTopicsLoading] = useState({});

  // Test state
  const [testSession, setTestSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(testSession?.duration * 60 || 0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  // Results state
  const [testResult, setTestResult] = useState(null);
  const [detailedQuestions, setDetailedQuestions] = useState([]);
  const [testStartTime, setTestStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  useEffect(() => {
    fetchSubjects();
    if (user) {
      fetchAccessStatus();
    }
  }, [user]);

  const fetchAccessStatus = async () => {
    try {
      const response = await paymentAPI.getAccessStatus();
      setAccessStatus(response.data.data);
    } catch (error) {
      console.error("Failed to fetch access status:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await practiceAPI.getSubjects();
      setSubjects(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async (subjectIds, page = 1) => {
    try {
      const loadingState = {};
      subjectIds.forEach((id) => {
        loadingState[id] = true;
      });
      setTopicsLoading(loadingState);

      const response = await practiceAPI.getTopics(subjectIds, page, 14);
      const topicsData = response.data.data || {};

      setTopicsBySubject(topicsData);

      const pages = {};
      subjectIds.forEach((id) => {
        pages[id] = page;
      });
      setTopicPages(pages);

      const subjectsNeedingTopics = [];
      Object.keys(topicsData).forEach((subjectId) => {
        if (
          !topicsData[subjectId] ||
          topicsData[subjectId].topics.length === 0
        ) {
          subjectsNeedingTopics.push(subjectId);
        }
      });

      if (subjectsNeedingTopics.length > 0) {
        pollForTopics(subjectsNeedingTopics);
      } else {
        setTopicsLoading({});
      }
    } catch (error) {
      console.error("Failed to load topics:", error);
      toast.error("Failed to load topics");
      setTopicsLoading({});
    }
  };

  const pollForTopics = async (subjectIds, attempts = 0, maxAttempts = 20) => {
    if (attempts >= maxAttempts) {
      setTopicsLoading({});
      toast.error("Topic generation is taking longer than expected.");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await practiceAPI.getTopics(subjectIds, 1, 14);
      const topicsData = response.data.data || {};

      setTopicsBySubject((prev) => ({
        ...prev,
        ...topicsData,
      }));

      const stillNeedingTopics = [];
      const newLoadingState = { ...topicsLoading };

      subjectIds.forEach((subjectId) => {
        if (topicsData[subjectId]?.topics?.length > 0) {
          delete newLoadingState[subjectId];
        } else {
          stillNeedingTopics.push(subjectId);
        }
      });

      setTopicsLoading(newLoadingState);

      if (stillNeedingTopics.length > 0) {
        pollForTopics(stillNeedingTopics, attempts + 1, maxAttempts);
      } else {
        toast.success("Topics loaded successfully!");
      }
    } catch (error) {
      console.error("Error polling for topics:", error);
      if (attempts < maxAttempts - 1) {
        pollForTopics(subjectIds, attempts + 1, maxAttempts);
      } else {
        setTopicsLoading({});
      }
    }
  };

  const loadMoreTopics = async (subjectId) => {
    const currentPage = topicPages[subjectId] || 1;
    const nextPage = currentPage + 1;
    const currentTopics = topicsBySubject[subjectId]?.topics || [];
    const totalTopics =
      topicsBySubject[subjectId]?.pagination?.totalTopics || 0;

    try {
      setTopicsLoading((prev) => ({ ...prev, [subjectId]: true }));

      if (currentTopics.length >= totalTopics) {
        await practiceAPI.generateMoreTopics(subjectId);
        toast.success("Generating new topics...");
        pollForTopics([subjectId]);
        return;
      }

      const response = await practiceAPI.getTopics([subjectId], nextPage, 14);
      const newData = response.data.data[subjectId] || { topics: [] };

      if (newData.topics.length > 0) {
        setTopicsBySubject((prev) => ({
          ...prev,
          [subjectId]: {
            ...newData,
            topics: [...currentTopics, ...newData.topics],
          },
        }));

        setTopicPages((prev) => ({
          ...prev,
          [subjectId]: nextPage,
        }));

        toast.success(`Loaded ${newData.topics.length} more topics`);
      }
    } catch (error) {
      console.error("Failed to load more topics:", error);
      toast.error("Failed to load more topics");
    } finally {
      setTopicsLoading((prev) => {
        const newState = { ...prev };
        delete newState[subjectId];
        return newState;
      });
    }
  };

  const handleSubjectSelection = (selected) => {
    setSelectedSubjects(selected);
    if (selected.length > 0) {
      fetchTopics(selected);
    } else {
      setTopicsBySubject({});
      setSelectedTopics({});
    }
  };
  useEffect(() => {
    let intervalId = null;

    if (currentStep === "test" && testStartTime) {
      intervalId = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - testStartTime) / 1000));
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentStep, testStartTime]);

  const startTest = async () => {
    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    if (totalQuestions < 1 || totalQuestions > 100) {
      toast.error("Please select between 1 and 100 questions");
      return;
    }

    try {
      setGeneratingQuestions(true);

      const topicsArray = [];
      if (!useRandomTopics) {
        selectedSubjects.forEach((subjectId) => {
          const subjectTopics = selectedTopics[subjectId] || [];
          topicsArray.push(...subjectTopics);
        });
      }

      const testConfig = {
        subjects: selectedSubjects,
        topics: topicsArray,
        useRandomTopics,
        difficulty,
        totalQuestions,
        duration: testDuration,
      };

      const response = await practiceAPI.startTest(testConfig);
      const session = response.data?.data;

      if (!session) {
        throw new Error("Invalid response from server");
      }

      setTestSession(session);
      setTimeLeft(session.duration * 60 * 1000);

      setTestStartTime(Date.now());
      setElapsedTime(0);

      setCurrentStep("test");

      toast.success("Test started! Good luck!");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to start test";
      toast.error(message);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleQuestionNavigation = (newIndex) => {
    const hasAccess = user?.role === "ADMIN" || accessStatus?.hasAccess;
    const freeLimit =
      testSession?.freeLimit ?? accessStatus?.freeQuestionLimit ?? 5;

    if (!hasAccess && newIndex >= freeLimit) {
      setShowAccessModal(true);
      return;
    }

    if (newIndex >= 0 && newIndex < (testSession?.questions?.length || 0)) {
      setCurrentQuestionIndex(newIndex);
    }
  };

  const handleFlagQuestion = (questionIndex) => {
    setFlaggedQuestions((prev) =>
      prev.includes(questionIndex)
        ? prev.filter((i) => i !== questionIndex)
        : [...prev, questionIndex]
    );
  };

  const handleBookmarkQuestion = (questionIndex) => {
    setBookmarkedQuestions((prev) =>
      prev.includes(questionIndex)
        ? prev.filter((i) => i !== questionIndex)
        : [...prev, questionIndex]
    );
  };

  const submitTest = async () => {
    try {
      setLoading(true);
      setShowSubmitModal(false);

      const answersArray = testSession.questions.map((question, index) => ({
        questionId: question.id,
        userAnswer: answers[index] !== undefined ? answers[index] : null,
      }));

      const actualTimeSpent = elapsedTime;

      const submissionData = {
        testSessionId: testSession.id,
        answers: answersArray,
        timeSpent: actualTimeSpent, // FIXED: Use tracked time
      };

      const response = await practiceAPI.submitTest(submissionData);
      const result = response.data?.data;

      if (result) {
        setTestResult(result.testResult);
        setDetailedQuestions(result.questions);
        setCurrentStep("results");
        toast.success("Test submitted successfully!");
      }
    } catch (error) {
      console.error("Submit test error:", error);
      const message = error.response?.data?.message || "Failed to submit test";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    const hasAccess = user?.role === "ADMIN" || accessStatus?.hasAccess;

    if (!hasAccess) {
      toast.error("Time's up! Please upgrade to submit your test.");
      setShowAccessModal(true);
      return;
    }

    toast.error("Time's up! Submitting test...");
    submitTest();
  };

  const retakeTest = () => {
    setCurrentStep("setup");
    setTestSession(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFlaggedQuestions([]);
    setBookmarkedQuestions([]);
    setTestResult(null);
    setDetailedQuestions([]);
    setTimeLeft(0);
    setTestStartTime(null);
    setElapsedTime(0);
  };

  const downloadPDF = async () => {
    const hasAccess =
      user?.role === "ADMIN" ||
      (accessStatus?.hasAccess && !accessStatus?.isExpired);

    if (!hasAccess) {
      toast.error("Payment required to download PDF");
      window.location.href = "/payments";
      return;
    }

    try {
      await practiceAPI.downloadTestPDF(testResult.id);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      if (error.response?.data?.requiresPayment) {
        toast.error("Payment required");
        window.location.href = "/payments";
      } else {
        toast.error("Failed to download PDF");
      }
    }
  };

  const difficultyOptions = [
    {
      value: "EASY",
      label: "Easy",
      icon: SparklesIcon,
      color: "from-green-500 to-emerald-600",
      description: "Perfect for beginners",
    },
    {
      value: "MEDIUM",
      label: "Medium",
      icon: FireIcon,
      color: "from-yellow-500 to-orange-600",
      description: "Balanced challenge",
    },
    {
      value: "HARD",
      label: "Hard",
      icon: BoltIcon,
      color: "from-red-500 to-rose-600",
      description: "Expert level",
    },
  ];

  /* -------------------------
     Render helpers (setup/test/results)
     ------------------------- */

  const renderSetupStep = () => (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl mb-6 shadow-2xl"
        >
          <AcademicCapIcon className="w-11 h-11 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-heading mb-4 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-secondary-400"
        >
          Practice Test
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          Build confidence with our intelligent practice system
        </motion.p>
      </motion.div>

      {/* Subject Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-charcoal-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-charcoal-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-heading text-gray-900 dark:text-white mb-2">
              Select Your Subjects
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose up to 5 subjects for your practice test
            </p>
          </div>
          <div className="text-right">
            <motion.div
              key={selectedSubjects.length}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
            >
              {selectedSubjects.length}/5
            </motion.div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Selected
            </div>
          </div>
        </div>

        <SubjectSelector
          subjects={subjects}
          selectedSubjects={selectedSubjects}
          onSelectionChange={handleSubjectSelection}
          loading={loading}
          maxSelection={5}
        />
      </motion.div>

      {/* Topics Selection */}
      <AnimatePresence>
        {selectedSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-charcoal-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-charcoal-700"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Choose Your Topics
            </h2>

            {/* Random Topics Toggle */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      Random Selection Mode
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get questions from random topics automatically
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUseRandomTopics(!useRandomTopics)}
                  className={`relative inline-flex h-10 w-18 items-center rounded-full transition-all shadow-lg ${
                    useRandomTopics
                      ? "bg-gradient-to-r from-purple-500 to-pink-600"
                      : "bg-gray-300 dark:bg-charcoal-600"
                  }`}
                >
                  <motion.span
                    layout
                    className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform ${
                      useRandomTopics ? "translate-x-9" : "translate-x-1"
                    }`}
                  >
                    {useRandomTopics && (
                      <CheckIcon className="w-5 h-5 text-purple-600 m-auto mt-1.5" />
                    )}
                  </motion.span>
                </button>
              </div>
            </motion.div>

            {!useRandomTopics && (
              <TopicSelector
                subjects={subjects}
                selectedSubjects={selectedSubjects}
                selectedTopics={selectedTopics}
                onTopicChange={setSelectedTopics}
                topicsBySubject={topicsBySubject}
                loading={Object.keys(topicsLoading).length > 0}
                onLoadMoreTopics={loadMoreTopics}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Configuration */}
      <AnimatePresence>
        {selectedSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-charcoal-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-charcoal-700"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Configure Your Test
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {difficultyOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDifficulty(option.value)}
                        className={`relative p-6 rounded-2xl border-2 transition-all ${
                          difficulty === option.value
                            ? "border-transparent shadow-2xl"
                            : "border-gray-200 dark:border-charcoal-600 hover:border-gray-300 dark:hover:border-charcoal-500 bg-white dark:bg-charcoal-700"
                        }`}
                      >
                        {difficulty === option.value && (
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${option.color} opacity-10 rounded-2xl`}
                          />
                        )}
                        <div className="relative">
                          <div
                            className={`w-14 h-14 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg`}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                              {option.label}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={totalQuestions}
                  onChange={(e) =>
                    setTotalQuestions(parseInt(e.target.value) || 1)
                  }
                  className="w-full px-6 py-4 text-3xl font-bold text-center border-2 border-gray-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Min: 1</span>
                  <span>Max: 100</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={testDuration}
                  onChange={(e) =>
                    setTestDuration(parseInt(e.target.value) || 5)
                  }
                  className="w-full px-6 py-4 text-3xl font-bold text-center border-2 border-gray-300 dark:border-charcoal-600 bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
                />
                <div className="flex items-center justify-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Recommended: {Math.ceil(totalQuestions * 1.5)} min
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                  Test Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subjects:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedSubjects.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Questions:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Duration:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {testDuration} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Difficulty:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startTest}
                disabled={generatingQuestions}
                className="inline-flex items-center space-x-3 px-12 py-5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingQuestions ? (
                  <>
                    <LoadingSpinner size="md" color="white" />
                    <span>Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <span>Start Practice Test</span>
                    <ArrowRightIcon className="w-6 h-6" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderTestStep = () => (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl p-4 mb-6 sticky top-4 z-10 backdrop-blur-lg border border-gray-100 dark:border-charcoal-700"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Question{" "}
              <span className="text-primary-600 dark:text-primary-400 font-bold">
                {currentQuestionIndex + 1}
              </span>{" "}
              of {testSession?.questions?.length || 0}
            </div>
            <div className="h-4 w-px bg-gray-300 dark:border-charcoal-600"></div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              <span className="text-green-600 dark:text-green-400 font-bold">
                {Object.keys(answers).length}
              </span>{" "}
              answered
            </div>
          </div>

          <Timer
            initialTime={testSession.duration * 60}
            onTimeUp={submitTest}
            onTimeChange={setTimeLeft}
            autoStart={true}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSubmitModal(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Submit Test
          </motion.button>
        </div>
      </motion.div>

      <QuestionContainer
        questions={testSession?.questions || []}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        onAnswerSelect={handleAnswerSelect}
        onNavigate={handleQuestionNavigation}
        onFlag={handleFlagQuestion}
        onBookmark={handleBookmarkQuestion}
        flaggedQuestions={flaggedQuestions}
        bookmarkedQuestions={bookmarkedQuestions}
      />

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Test?"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-warning-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-900 dark:text-white font-medium">
                Are you sure you want to submit this test?
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                You cannot change your answers once submitted.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-charcoal-700 p-4 rounded-xl">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Questions:
                </span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {testSession?.questions?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Answered:
                </span>
                <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                  {Object.keys(answers).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Unanswered:
                </span>
                <span className="ml-2 font-semibold text-warning-600">
                  {(testSession?.questions?.length || 0) -
                    Object.keys(answers).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Time Left:
                </span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="px-6 py-2.5 border-2 border-gray-300 dark:border-charcoal-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-charcoal-700 transition-all"
            >
              Continue Test
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={submitTest}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" color="white" />
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Test"
              )}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );

  const renderResultsStep = () => (
    <TestResults
      testResult={testResult}
      questions={detailedQuestions}
      onRetakeTest={retakeTest}
      onDownloadPDF={downloadPDF}
      loading={loading}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br relative from-slate-50 via-blue-50 to-indigo-50 dark:from-charcoal-900 dark:via-charcoal-900 dark:to-charcoal-800 py-12 px-4 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary-500/25 rounded-full blur-3xl"
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
          className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"
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
      <div className="container mx-auto max-w-7xl">
        <Modal
          isOpen={showAccessModal}
          onClose={() => setShowAccessModal(false)}
          title="Upgrade Required"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <LockClosedIcon className="w-8 h-8 text-primary-500 flex-shrink-0" />
              <div>
                <p className="text-gray-900 dark:text-white font-medium mb-2">
                  Payment required to access this feature
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Free users can only answer the first{" "}
                  {accessStatus?.freeQuestionLimit ?? 5} questions. Upgrade to:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    Complete and submit full tests
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    Download test results as PDF
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    Access all study materials
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowAccessModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Maybe Later
              </button>
              <a
                href="/payments"
                className="px-4 py-2 bg-primary-600 text-white rounded-md"
              >
                View Plans
              </a>
            </div>
          </div>
        </Modal>

        <AnimatePresence mode="wait">
          {currentStep === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderSetupStep()}
            </motion.div>
          )}

          {currentStep === "test" && (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTestStep()}
            </motion.div>
          )}

          {currentStep === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderResultsStep()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Practice;
