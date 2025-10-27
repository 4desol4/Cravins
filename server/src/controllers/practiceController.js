const prisma = require("../config/database");
const {
  generateAndSaveTopics,
  generateTestQuestions,
  calculateTestScore,
} = require("../services/questionService");
const { generateTestResultsPDF } = require("../utils/pdfGenerator");
const {
  apiResponse,
  paginate,
  formatPaginationResponse,
} = require("../utils/helpers");
const {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NIGERIAN_SUBJECTS,
} = require("../utils/constants");

/**
 * Get all subjects
 */
const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            topics: true,
            questions: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json(apiResponse(true, "Subjects retrieved successfully", subjects));
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Get topics for subjects with pagination
 */
const getTopics = async (req, res) => {
  try {
    const { subjectIds, page = 1, limit = 14 } = req.body;

    if (!subjectIds || !Array.isArray(subjectIds)) {
      return res
        .status(400)
        .json(apiResponse(false, "Subject IDs are required"));
    }

    const topicsBySubject = {};

    for (const subjectId of subjectIds) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
      });

      if (!subject) continue;

      // Get existing topics with pagination
      const skip = (page - 1) * limit;
      const topics = await prisma.topic.findMany({
        where: { subjectId, isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      const totalTopics = await prisma.topic.count({
        where: { subjectId, isActive: true },
      });

      // If no topics exist and it's the first page, trigger generation
      if (totalTopics === 0 && page === 1) {
        // Trigger topic generation asynchronously (don't wait for it)
        generateAndSaveTopics(subjectId, subject.name, 14)
          .then((newTopics) => {
            console.log(
              `Generated ${newTopics.length} topics for ${subject.name}`
            );
          })
          .catch((error) => {
            console.error(
              `Failed to generate topics for ${subject.name}:`,
              error
            );
          });
      }

      topicsBySubject[subjectId] = {
        subjectName: subject.name,
        topics,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTopics / limit),
          totalTopics,
          hasMore: totalTopics > page * limit,
        },
      };
    }

    res.json(
      apiResponse(true, "Topics retrieved successfully", topicsBySubject)
    );
  } catch (error) {
    console.error("Get topics error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Generate more topics for a subject
 * Enforces Nigerian curriculum 70-topic maximum
 */
const generateMoreTopics = async (req, res) => {
  try {
    const { subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json(apiResponse(false, "Subject ID is required"));
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      return res.status(404).json(apiResponse(false, "Subject not found"));
    }

    // Check current topic count
    const currentCount = await prisma.topic.count({
      where: { subjectId, isActive: true },
    });

    if (currentCount >= 70) {
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            "Nigerian curriculum complete - Maximum 70 topics reached for this subject"
          )
        );
    }

    const remaining = 70 - currentCount;
    const toGenerate = Math.min(14, remaining);

    // Generate topics asynchronously
    generateAndSaveTopics(subjectId, subject.name, toGenerate)
      .then((newTopics) => {
        const newTotal = currentCount + newTopics.length;
        console.log(
          `✓ Generated ${newTopics.length} topics for ${subject.name} (${newTotal}/70)`
        );
      })
      .catch((error) => {
        console.error(`Error generating topics for ${subject.name}:`, error);
      });

    // Return immediately with generation status
    res.json(
      apiResponse(
        true,
        `Generating ${toGenerate} new topics based on Nigerian curriculum...`,
        {
          message: "Topics are being generated in the background",
          currentCount,
          generating: toGenerate,
          maxCount: 70,
          remaining: remaining,
        }
      )
    );
  } catch (error) {
    console.error("Generate more topics error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Start a new test
 */
const startTest = async (req, res) => {
  try {
    const {
      subjects,
      topics = [],
      difficulty,
      totalQuestions,
      duration,
      useRandomTopics = false,
    } = req.body;

    // Get payment settings
    const settings = await prisma.paymentSettings.findFirst();
    const freeLimit = settings?.freeQuestionLimit || 5;

    // Check if user has paid
    const userHasPaid =
      req.user.role === "ADMIN" ||
      (req.user.hasPaid &&
        (!req.user.paymentExpiry ||
          new Date() <= new Date(req.user.paymentExpiry)));

    // Limit questions for free users
    let actualQuestions = totalQuestions;
    if (!userHasPaid && totalQuestions > freeLimit) {
      actualQuestions = freeLimit;
    }

    // Validate subjects exist
    const subjectRecords = await prisma.subject.findMany({
      where: {
        id: { in: subjects },
        isActive: true,
      },
    });

    if (subjectRecords.length !== subjects.length) {
      return res
        .status(400)
        .json(apiResponse(false, "One or more subjects not found"));
    }

    // Generate questions
    const questions = await generateTestQuestions({
      subjects,
      topics: useRandomTopics ? [] : topics,
      difficulty,
      totalQuestions: actualQuestions,
    });

    if (questions.length === 0) {
      return res
        .status(400)
        .json(
          apiResponse(false, "No questions available for selected criteria")
        );
    }

    // Calculate test duration
    const testDuration = duration || Math.max(actualQuestions * 1.5, 30);

    // Generate test name
    const testName = `${subjectRecords
      .map((s) => s.name)
      .join(", ")} - ${difficulty} - ${new Date().toLocaleDateString()}`;

    // Create a TestSession in DB
    const testSession = await prisma.test.create({
      data: {
        name: testName,
        subjects: subjectRecords.map((s) => s.id),
        topics: useRandomTopics ? [] : topics,
        difficulty,
        totalQuestions: questions.length,
        duration: testDuration,
      },
    });

    // Return response with access information
    res.json(
      apiResponse(true, "Test started successfully", {
        id: testSession.id,
        name: testSession.name,
        duration: testDuration,
        subjects: subjectRecords.map((s) => s.name),
        topics: testSession.topics,
        difficulty: testSession.difficulty,
        totalQuestions: testSession.totalQuestions,
        startedAt: new Date(),
        hasFullAccess: userHasPaid,
        freeLimit: userHasPaid ? null : freeLimit,
        isLimited: !userHasPaid && totalQuestions > freeLimit,
        questions: questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          subject: q.subject?.name || "Unknown",
          topic: q.topic?.name || "Unknown",
        })),
      })
    );
  } catch (error) {
    console.error("Start test error:", error);
    res
      .status(500)
      .json(apiResponse(false, error.message || ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Submit test answers
 */
const submitTest = async (req, res) => {
  try {
    const { testSessionId, answers, timeSpent } = req.body;

    // Check if user has paid for full access
    const userHasPaid =
      req.user.role === "ADMIN" ||
      (req.user.hasPaid &&
        (!req.user.paymentExpiry ||
          new Date() <= new Date(req.user.paymentExpiry)));

    if (!userHasPaid) {
      return res.status(403).json(
        apiResponse(false, ERROR_MESSAGES.PAYMENT_REQUIRED, null, {
          requiresPayment: true,
          message:
            "Please complete payment to submit your test and view results",
        })
      );
    }

    // Fetch test session
    const testSession = await prisma.test.findUnique({
      where: { id: testSessionId },
    });

    if (!testSession) {
      return res.status(404).json(apiResponse(false, "Test session not found"));
    }

    // Get questions for scoring
    const questionIds = answers.map((a) => a.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { subject: true, topic: true },
    });

    // Create user answers array
    const userAnswers = questions.map((question) => {
      const userAnswer = answers.find((a) => a.questionId === question.id);
      return userAnswer ? userAnswer.userAnswer : null;
    });

    // Calculate score
    const scoreResult = calculateTestScore(questions, userAnswers);

    // Create test result
    const testResult = await prisma.testResult.create({
      data: {
        userId: req.user.id,
        testId: testSession.id,
        testName: testSession.name,
        subjects: testSession.subjects,
        topics: testSession.topics,
        difficulty: testSession.difficulty,
        totalQuestions: testSession.totalQuestions,
        correctAnswers: scoreResult.correctAnswers,
        score: scoreResult.score,
        timeSpent: timeSpent || 0,
        subjectScores: scoreResult.subjectScores,
        isComplete: true,
      },
    });

    // Save individual question results
    await Promise.all(
      scoreResult.questionResults.map((result) =>
        prisma.testQuestion.create({
          data: {
            testResultId: testResult.id,
            questionId: result.questionId,
            userAnswer: result.userAnswer,
            isCorrect: result.isCorrect,
            timeSpent: result.timeSpent,
          },
        })
      )
    );

    res.json(
      apiResponse(true, SUCCESS_MESSAGES.TEST_SUBMITTED, {
        testResult: {
          id: testResult.id,
          score: testResult.score,
          correctAnswers: testResult.correctAnswers,
          totalQuestions: testResult.totalQuestions,
          timeSpent: testResult.timeSpent,
          subjectScores: testResult.subjectScores,
          completedAt: testResult.completedAt,
          canDownloadPDF: true,
        },
        questions: questions.map((q, index) => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          userAnswer: userAnswers[index],
          isCorrect: scoreResult.questionResults[index]?.isCorrect,
          subject: q.subject?.name,
          topic: q.topic?.name,
        })),
      })
    );
  } catch (error) {
    console.error("Submit test error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Get user's test history
 */
const getTestHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const skip = (page - 1) * limit;

    const [testResults, total] = await Promise.all([
      prisma.testResult.findMany({
        where: { userId, isComplete: true },
        include: {
          questions: {
            include: {
              question: {
                select: {
                  text: true,
                  options: true,
                  correctAnswer: true,
                  explanation: true,
                },
              },
            },
          },
        },
        orderBy: { completedAt: "desc" },
        skip: parseInt(skip),
        take: parseInt(limit),
      }),
      prisma.testResult.count({ where: { userId, isComplete: true } }),
    ]);

    const userHasPaid =
      req.user.role === "ADMIN" ||
      (req.user.hasPaid &&
        (!req.user.paymentExpiry ||
          new Date() <= new Date(req.user.paymentExpiry)));

    res.json(
      apiResponse(true, "Test history retrieved successfully", {
        data: testResults,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          limit: parseInt(limit),
        },
        canDownloadPDF: userHasPaid,
      })
    );
  } catch (error) {
    console.error("Get test history error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Get test result details
 */
const getTestResult = async (req, res) => {
  try {
    const { testId } = req.params;

    const testResult = await prisma.testResult.findFirst({
      where: {
        id: testId,
        userId: req.user.id,
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                subject: true,
                topic: true,
              },
            },
          },
        },
      },
    });

    if (!testResult) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    res.json(
      apiResponse(true, "Test result retrieved successfully", testResult)
    );
  } catch (error) {
    console.error("Get test result error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Download test result as PDF (Premium feature)
 */
const downloadTestPDF = async (req, res) => {
  try {
    const { testId } = req.params;

    // Check if user has paid
    const userHasPaid =
      req.user.role === "ADMIN" ||
      (req.user.hasPaid &&
        (!req.user.paymentExpiry ||
          new Date() <= new Date(req.user.paymentExpiry)));

    if (!userHasPaid) {
      return res.status(403).json(
        apiResponse(false, ERROR_MESSAGES.PAYMENT_REQUIRED, null, {
          requiresPayment: true,
          message: "Please complete payment to download test results",
        })
      );
    }

    const testResult = await prisma.testResult.findFirst({
      where: {
        id: testId,
        userId: req.user.id,
      },
      include: {
        questions: {
          include: {
            question: {
              include: {
                subject: true,
                topic: true,
              },
            },
          },
        },
      },
    });

    if (!testResult) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    // Generate PDF
    const questions = testResult.questions.map((tq) => ({
      ...tq.question,
      userAnswer: tq.userAnswer,
      isCorrect: tq.isCorrect,
    }));

    const pdfBuffer = await generateTestResultsPDF(
      testResult,
      questions,
      req.user
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="test-result-${testResult.id}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Download test PDF error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await prisma.testResult.aggregate({
      where: { userId },
      _avg: { score: true },
      _count: { id: true },
      _max: { score: true },
    });

    const recentTests = await prisma.testResult.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 5,
      select: {
        id: true,
        testName: true,
        score: true,
        completedAt: true,
        subjects: true,
      },
    });

    const subjectPerformance = await prisma.testResult.findMany({
      where: { userId },
      select: {
        subjects: true,
        score: true,
      },
    });

    // Calculate subject-wise average scores
    const subjectStats = {};
    subjectPerformance.forEach((result) => {
      result.subjects.forEach((subject) => {
        if (!subjectStats[subject]) {
          subjectStats[subject] = { scores: [], count: 0 };
        }
        subjectStats[subject].scores.push(result.score);
        subjectStats[subject].count++;
      });
    });

    Object.keys(subjectStats).forEach((subject) => {
      const scores = subjectStats[subject].scores;
      subjectStats[subject].average =
        scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    res.json(
      apiResponse(true, "User statistics retrieved successfully", {
        overallStats: {
          totalTests: stats._count.id || 0,
          averageScore: stats._avg.score || 0,
          highestScore: stats._max.score || 0,
        },
        recentTests,
        subjectPerformance: subjectStats,
      })
    );
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Initialize subjects (Admin only)
 */
const initializeSubjects = async (req, res) => {
  try {
    const existingSubjects = await prisma.subject.findMany();

    if (existingSubjects.length > 0) {
      return res
        .status(400)
        .json(apiResponse(false, "Subjects already initialized"));
    }

    // Create Nigerian subjects
    const subjects = await Promise.all(
      NIGERIAN_SUBJECTS.map((subjectName) =>
        prisma.subject.create({
          data: {
            name: subjectName,
            description: `${subjectName} - Nigerian Secondary School Curriculum`,
          },
        })
      )
    );

    // Generate initial 14 topics for each subject asynchronously
    subjects.forEach((subject) => {
      generateAndSaveTopics(subject.id, subject.name, 14).catch(console.error);
    });

    res
      .status(201)
      .json(
        apiResponse(
          true,
          "Subjects initialized successfully. Topics are being generated in the background.",
          subjects
        )
      );
  } catch (error) {
    console.error("Initialize subjects error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Manage subject (Admin only)
 */
const manageSubject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { subjectId } = req.params;

    if (subjectId) {
      // Update existing subject
      const updatedSubject = await prisma.subject.update({
        where: { id: subjectId },
        data: { name, description },
      });

      res.json(
        apiResponse(true, "Subject updated successfully", updatedSubject)
      );
    } else {
      // Create new subject
      const subject = await prisma.subject.create({
        data: { name, description },
      });

      // Generate initial 14 topics for the new subject asynchronously
      generateAndSaveTopics(subject.id, subject.name, 14).catch(console.error);

      res
        .status(201)
        .json(
          apiResponse(
            true,
            "Subject created successfully. Topics are being generated.",
            subject
          )
        );
    }
  } catch (error) {
    console.error("Manage subject error:", error);

    if (error.code === "P2002") {
      return res
        .status(400)
        .json(apiResponse(false, "Subject name already exists"));
    }

    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

module.exports = {
  getSubjects,
  getTopics,
  generateMoreTopics,
  startTest,
  submitTest,
  getTestHistory,
  getTestResult,
  downloadTestPDF,
  getUserStats,
  initializeSubjects,
  manageSubject,
};

