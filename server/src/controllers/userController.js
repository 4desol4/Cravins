const prisma = require("../config/database");
const { processImageUpload } = require("../services/fileService");
const {
  apiResponse,
  paginate,
  formatPaginationResponse,
} = require("../utils/helpers");
const { generateAndSaveTopics } = require("../services/questionService");
const {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NIGERIAN_SUBJECTS,
} = require("../utils/constants");

/**
 * Get user dashboard data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, testStats, recentTests, latestNews, purchasedMaterials] =
      await Promise.all([
        // User details
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            hasPaid: true,
            paymentExpiry: true,
            paymentType: true,
            avatar: true,
            createdAt: true,
          },
        }),

        // Test statistics
        prisma.testResult.aggregate({
          where: { userId },
          _count: { id: true },
          _avg: { score: true },
          _max: { score: true },
        }),

        // Recent test results
        prisma.testResult.findMany({
          where: { userId },
          orderBy: { completedAt: "desc" },
          take: 5,
          select: {
            id: true,
            testName: true,
            score: true,
            subjects: true,
            completedAt: true,
          },
        }),

        // Latest news
        prisma.news.findMany({
          where: { isPublished: true },
          orderBy: { publishedAt: "desc" },
          take: 3,
          select: {
            id: true,
            title: true,
            excerpt: true,
            image: true,
            publishedAt: true,
          },
        }),

        // Recent purchased/downloaded materials
        prisma.materialDownload.findMany({
          where: { userId },
          orderBy: { downloadedAt: "desc" },
          take: 3,
          include: {
            material: {
              select: {
                id: true,
                title: true,
                fileType: true,
              },
            },
          },
        }),
      ]);

    const dashboardData = {
      user,
      stats: {
        totalTests: testStats._count.id || 0,
        averageScore: testStats._avg.score || 0,
        highestScore: testStats._max.score || 0,
        materialsOwned: purchasedMaterials.length,
      },
      recentTests,
      latestNews,
      recentMaterials: purchasedMaterials.map((pm) => ({
        ...pm.material,
        downloadedAt: pm.downloadedAt,
      })),
    };

    res.json(
      apiResponse(true, "Dashboard data retrieved successfully", dashboardData)
    );
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Upload user avatar
 */
const uploadAvatar = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json(apiResponse(false, "Avatar image is required"));
    }

    // Upload to Cloudinary
    const uploadResult = await processImageUpload(file, "cravins/avatars");

    // Update user avatar
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: uploadResult.url },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        hasPaid: true,
        paymentExpiry: true,
        paymentType: true,
      },
    });

    res.json(apiResponse(true, "Avatar uploaded successfully", updatedUser));
  } catch (error) {
    console.error("Upload avatar error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Get user achievements/badges
 */
const getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;

    const [testResults, totalTests] = await Promise.all([
      prisma.testResult.findMany({
        where: { userId },
        select: {
          score: true,
          subjects: true,
          completedAt: true,
        },
      }),
      prisma.testResult.count({ where: { userId } }),
    ]);

    const achievements = [];

    // Test completion badges
    if (totalTests >= 1)
      achievements.push({
        id: "first_test",
        title: "First Steps",
        description: "Completed your first test",
        icon: "🎯",
        unlockedAt: testResults[0]?.completedAt,
      });

    if (totalTests >= 10)
      achievements.push({
        id: "dedicated_learner",
        title: "Dedicated Learner",
        description: "Completed 10 tests",
        icon: "📚",
        unlockedAt: testResults[9]?.completedAt,
      });

    if (totalTests >= 50)
      achievements.push({
        id: "test_master",
        title: "Test Master",
        description: "Completed 50 tests",
        icon: "🏆",
        unlockedAt: testResults[49]?.completedAt,
      });

    // Score-based badges
    const highScores = testResults.filter((t) => t.score >= 90).length;
    if (highScores >= 5)
      achievements.push({
        id: "high_achiever",
        title: "High Achiever",
        description: "Scored 90%+ on 5 tests",
        icon: "⭐",
      });

    const averageScore =
      testResults.reduce((sum, t) => sum + t.score, 0) / testResults.length;
    if (averageScore >= 80)
      achievements.push({
        id: "consistent_performer",
        title: "Consistent Performer",
        description: "Maintained 80%+ average score",
        icon: "🎖️",
      });

    res.json(
      apiResponse(true, "Achievements retrieved successfully", achievements)
    );
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};
/**
 * Get user notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;

    const notifications = [];

    // Payment expiry notification
    if (user.hasPaid && user.paymentExpiry) {
      const daysUntilExpiry = Math.ceil(
        (new Date(user.paymentExpiry) - new Date()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
        notifications.push({
          id: "payment_expiry",
          type: "warning",
          title: "Access Expiring Soon",
          message: `Your ${user.paymentType?.toLowerCase()} access expires in ${daysUntilExpiry} days`,
          createdAt: new Date(),
        });
      } else if (daysUntilExpiry <= 0) {
        notifications.push({
          id: "payment_expired",
          type: "error",
          title: "Access Expired",
          message:
            "Your access has expired. Renew to continue enjoying all features.",
          createdAt: new Date(),
        });
      }
    }

    // New features notification
    if (!user.hasPaid) {
      notifications.push({
        id: "upgrade_prompt",
        type: "info",
        title: "Unlock All Features",
        message: "Upgrade to paid access for unlimited tests and downloads!",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      });
    }

    // Study reminder
    const lastTest = await prisma.testResult.findFirst({
      where: { userId },
      orderBy: { completedAt: "desc" },
    });

    if (lastTest) {
      const daysSinceLastTest = Math.floor(
        (new Date() - new Date(lastTest.completedAt)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastTest >= 3) {
        notifications.push({
          id: "study_reminder",
          type: "info",
          title: "Time to Practice!",
          message: `It's been ${daysSinceLastTest} days since your last test. Keep up the momentum!`,
          createdAt: new Date(),
        });
      }
    }

    res.json(
      apiResponse(true, "Notifications retrieved successfully", notifications)
    );
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const where = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const query = {
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isPremium: true,
        premiumExpiry: true,
        createdAt: true,
        _count: {
          select: {
            testResults: true,
            materialPurchases: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    };

    const paginatedQuery = paginate(query, parseInt(page), parseInt(limit));

    const [users, total] = await Promise.all([
      prisma.user.findMany(paginatedQuery),
      prisma.user.count({ where }),
    ]);

    const formattedResults = formatPaginationResponse(
      users,
      total,
      parseInt(page),
      parseInt(limit)
    );

    res.json(
      apiResponse(true, "Users retrieved successfully", formattedResults)
    );
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isPremium } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.USER_NOT_FOUND));
    }

    const updateData = {};

    if (role) {
      updateData.role = role;
    }

    if (isPremium !== undefined) {
      updateData.isPremium = isPremium;
      if (isPremium && !user.premiumExpiry) {
        // Set premium expiry to 1 year from now
        updateData.premiumExpiry = new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isPremium: true,
        premiumExpiry: true,
      },
    });

    res.json(
      apiResponse(true, "User status updated successfully", updatedUser)
    );
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};
const getAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      userGrowth,
      testActivity,
      revenueData,
      topPerformers,
      subjectPopularity,
    ] = await Promise.all([
      // User growth over time
      prisma.user.groupBy({
        by: ["createdAt"],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: "asc" },
      }),

      // Test activity over time
      prisma.testResult.groupBy({
        by: ["completedAt"],
        _count: { id: true },
        _avg: { score: true },
        where: {
          completedAt: { gte: startDate },
        },
        orderBy: { completedAt: "asc" },
      }),

      // Revenue data
      prisma.payment.groupBy({
        by: ["createdAt"],
        _sum: { amount: true },
        _count: { id: true },
        where: {
          status: "SUCCESS",
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: "asc" },
      }),

      // Top performing students
      prisma.testResult.groupBy({
        by: ["userId"],
        _avg: { score: true },
        _count: { id: true },
        having: {
          id: { _count: { gte: 5 } },
        },
        orderBy: { _avg: { score: "desc" } },
        take: 10,
      }),

      // Subject popularity
      prisma.testResult.findMany({
        where: {
          completedAt: { gte: startDate },
        },
        select: { subjects: true },
      }),
    ]);

    // Process subject popularity
    const subjectCounts = {};
    testActivity.forEach((result) => {
      result.subjects.forEach((subject) => {
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      });
    });

    const analytics = {
      userGrowth: userGrowth.map((item) => ({
        date: item.createdAt,
        count: item._count.id,
      })),
      testActivity: testActivity.map((item) => ({
        date: item.completedAt,
        count: item._count.id,
        averageScore: item._avg.score,
      })),
      revenue: revenueData.map((item) => ({
        date: item.createdAt,
        amount: item._sum.amount,
        transactions: item._count.id,
      })),
      topPerformers: await Promise.all(
        topPerformers.map(async (item) => {
          const user = await prisma.user.findUnique({
            where: { id: item.userId },
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          });
          return {
            user,
            averageScore: item._avg.score,
            testCount: item._count.id,
          };
        })
      ),
      subjectPopularity: Object.entries(subjectCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([subject, count]) => ({ subject, count })),
    };

    res.json(apiResponse(true, "Analytics retrieved successfully", analytics));
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

module.exports = {
  getDashboard,
  uploadAvatar,
  getAchievements,
  getNotifications,
  getUsers,
  updateUserStatus,
  getAnalytics,
};
