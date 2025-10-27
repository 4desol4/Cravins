const prisma = require("../config/database");
const { generateTopics, generateQuestions } = require("../config/openai");

/**
 * Generate and save topics for a subject
 * Strictly follows Nigerian Senior Secondary School curriculum (max 70 topics)
 */
const generateAndSaveTopics = async (subjectId, subjectName, count = 14) => {
  try {
    // Check existing topic count
    const existingCount = await prisma.topic.count({
      where: { subjectId, isActive: true },
    });

    // HARD LIMIT: Maximum 70 topics per subject (Nigerian curriculum standard)
    if (existingCount >= 70) {
      console.log(
        `Maximum topic limit (70) reached for ${subjectName} - Nigerian curriculum complete`
      );
      return [];
    }

    // Adjust count to not exceed 70
    const topicsToGenerate = Math.min(count, 70 - existingCount);

    if (topicsToGenerate <= 0) {
      console.log(
        `No topics to generate for ${subjectName} - already at maximum`
      );
      return [];
    }

    // Get existing topics to avoid duplicates
    const existingTopics = await prisma.topic.findMany({
      where: { subjectId },
      select: { name: true },
    });
    const existingTopicNames = existingTopics.map((t) => t.name);

    console.log(
      `Generating ${topicsToGenerate} new topics for ${subjectName} (${existingCount}/70 exist)`
    );

    // Generate topics using AI with existing topics context
    const generatedTopics = await generateTopics(
      subjectName,
      topicsToGenerate,
      existingTopicNames
    );

    // Filter out duplicates (case-insensitive)
    const uniqueTopics = generatedTopics.filter(
      (topic) =>
        !existingTopicNames.some(
          (existing) => existing.toLowerCase() === topic.toLowerCase()
        )
    );

    if (uniqueTopics.length === 0) {
      console.log(`No new unique topics generated for ${subjectName}`);
      return [];
    }

    // Ensure we don't exceed 70 topics total
    const topicsToSave = uniqueTopics.slice(
      0,
      Math.min(uniqueTopics.length, 70 - existingCount)
    );

    // Save topics to database
    const savedTopics = await Promise.all(
      topicsToSave.map((topicName) =>
        prisma.topic.create({
          data: {
            name: topicName,
            subjectId,
          },
        })
      )
    );

    const newTotal = existingCount + savedTopics.length;
    console.log(
      `✓ Generated ${savedTopics.length} topics for ${subjectName} (${newTotal}/70 total)`
    );

    if (newTotal >= 70) {
      console.log(
        `✓ Nigerian curriculum complete for ${subjectName} - all 70 topics generated`
      );
    }

    return savedTopics;
  } catch (error) {
    console.error(`Error generating topics for ${subjectName}:`, error);
    throw error;
  }
};

/**
 * Generate test questions with uniqueness enforcement
 */
const generateTestQuestions = async ({
  subjects,
  topics = [],
  difficulty,
  totalQuestions,
}) => {
  try {
    let questions = [];

    // Try to get existing questions first
    const queryFilters = {
      subjectId: { in: subjects },
      difficulty,
      isActive: true,
    };

    // If specific topics selected, filter by them
    if (topics.length > 0) {
      queryFilters.topicId = { in: topics };
    }

    // Get existing questions (for uniqueness check and potential reuse)
    const existingQuestions = await prisma.question.findMany({
      where: queryFilters,
      include: {
        subject: true,
        topic: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: totalQuestions * 3, // Get more for randomization
    });

    // Randomize existing questions
    const shuffledExisting = existingQuestions.sort(() => Math.random() - 0.5);

    // If we have enough existing questions, use them
    if (shuffledExisting.length >= totalQuestions) {
      return shuffledExisting.slice(0, totalQuestions);
    }

    // Otherwise, we need to generate new questions
    const neededQuestions = totalQuestions - shuffledExisting.length;
    questions = [...shuffledExisting];

    // Get subject records
    const subjectRecords = await prisma.subject.findMany({
      where: { id: { in: subjects } },
    });

    // Get topics for generation
    let topicsForGeneration;
    if (topics.length > 0) {
      topicsForGeneration = await prisma.topic.findMany({
        where: { id: { in: topics } },
        include: { subject: true },
      });
    } else {
      // Get random topics from selected subjects
      topicsForGeneration = await prisma.topic.findMany({
        where: { subjectId: { in: subjects }, isActive: true },
        include: { subject: true },
      });

      // Randomize topics
      topicsForGeneration = topicsForGeneration
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(subjects.length * 5, 20));
    }

    if (topicsForGeneration.length === 0) {
      throw new Error(
        "No topics available. Please generate topics first or wait for topics to be generated."
      );
    }

    // Distribute questions across topics
    const questionsPerTopic = Math.ceil(
      neededQuestions / topicsForGeneration.length
    );

    for (const topic of topicsForGeneration) {
      if (questions.length >= totalQuestions) break;

      try {
        // Get existing questions for this topic to avoid duplicates
        const topicExistingQuestions = await prisma.question.findMany({
          where: {
            topicId: topic.id,
            difficulty,
            isActive: true,
          },
          select: {
            text: true,
          },
          take: 20, // Get recent questions for context
        });

        // Generate new unique questions
        const generatedQuestions = await generateQuestions(
          topic.subject.name,
          topic.name,
          difficulty,
          Math.min(questionsPerTopic, totalQuestions - questions.length),
          topicExistingQuestions
        );

        // Save generated questions to database
        const savedQuestions = await Promise.all(
          generatedQuestions.map((q) =>
            prisma.question.create({
              data: {
                text: q.text,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || "No explanation provided",
                difficulty,
                subjectId: topic.subjectId,
                topicId: topic.id,
              },
              include: {
                subject: true,
                topic: true,
              },
            })
          )
        );

        questions.push(...savedQuestions);
        console.log(
          `Generated ${savedQuestions.length} questions for ${topic.name}`
        );
      } catch (error) {
        console.error(
          `Error generating questions for topic ${topic.name}:`,
          error
        );
        // Continue with other topics even if one fails
        continue;
      }
    }

    // Ensure we have the requested number of questions
    if (questions.length < totalQuestions) {
      console.warn(
        `Only generated ${questions.length} out of ${totalQuestions} requested questions`
      );
    }

    // Shuffle final question set and return requested amount
    const finalQuestions = questions
      .sort(() => Math.random() - 0.5)
      .slice(0, totalQuestions);

    return finalQuestions;
  } catch (error) {
    console.error("Error generating test questions:", error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

/**
 * Calculate test score
 */
const calculateTestScore = (questions, userAnswers) => {
  let correctAnswers = 0;
  const questionResults = [];
  const subjectScores = {};

  questions.forEach((question, index) => {
    const isCorrect = userAnswers[index] === question.correctAnswer;
    if (isCorrect) correctAnswers++;

    // Track subject-wise scores
    const subjectName = question.subject?.name || "Unknown";
    if (!subjectScores[subjectName]) {
      subjectScores[subjectName] = { correct: 0, total: 0 };
    }
    subjectScores[subjectName].total++;
    if (isCorrect) subjectScores[subjectName].correct++;

    questionResults.push({
      questionId: question.id,
      userAnswer: userAnswers[index],
      isCorrect,
      timeSpent: 0,
    });
  });

  // Calculate percentage scores per subject
  const subjectScorePercentages = {};
  Object.keys(subjectScores).forEach((subject) => {
    const { correct, total } = subjectScores[subject];
    subjectScorePercentages[subject] = (correct / total) * 100;
  });

  const score = (correctAnswers / questions.length) * 100;

  return {
    correctAnswers,
    score: parseFloat(score.toFixed(2)),
    questionResults,
    subjectScores: subjectScorePercentages,
  };
};

/**
 * Get question analytics
 */
const getQuestionAnalytics = async (questionId) => {
  try {
    const testQuestions = await prisma.testQuestion.findMany({
      where: { questionId },
    });

    const totalAttempts = testQuestions.length;
    const correctAttempts = testQuestions.filter((tq) => tq.isCorrect).length;
    const successRate =
      totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

    const avgTimeSpent =
      totalAttempts > 0
        ? testQuestions.reduce((sum, tq) => sum + tq.timeSpent, 0) /
          totalAttempts
        : 0;

    return {
      totalAttempts,
      correctAttempts,
      successRate: parseFloat(successRate.toFixed(2)),
      avgTimeSpent: Math.round(avgTimeSpent),
    };
  } catch (error) {
    console.error("Error getting question analytics:", error);
    throw error;
  }
};

/**
 * Get topic performance for a user
 */
const getTopicPerformance = async (userId, topicId) => {
  try {
    const testResults = await prisma.testResult.findMany({
      where: {
        userId,
        topics: { has: topicId },
      },
      include: {
        questions: {
          include: {
            question: {
              where: { topicId },
            },
          },
        },
      },
    });

    const totalQuestions = testResults.reduce(
      (sum, result) => sum + result.questions.length,
      0
    );
    const correctAnswers = testResults.reduce(
      (sum, result) => sum + result.questions.filter((q) => q.isCorrect).length,
      0
    );

    const performance =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      correctAnswers,
      performance: parseFloat(performance.toFixed(2)),
      testsAttempted: testResults.length,
    };
  } catch (error) {
    console.error("Error getting topic performance:", error);
    throw error;
  }
};

module.exports = {
  generateAndSaveTopics,
  generateTestQuestions,
  calculateTestScore,
  getQuestionAnalytics,
  getTopicPerformance,
};
