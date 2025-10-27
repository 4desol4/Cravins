const prisma = require("../config/database");
const {
  processVideoUpload,
  processDocumentUpload,
  processImageUpload,
  extractYouTubeId,
  getYouTubeThumbnail,
} = require("../services/fileService");
const {
  apiResponse,
  paginate,
  formatPaginationResponse,
} = require("../utils/helpers");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../utils/constants");

/**
 * Get all subjects
 */
const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    res.json(apiResponse(true, "Subjects retrieved successfully", subjects));
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Create new subject
 */
const createSubject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res
        .status(400)
        .json(apiResponse(false, "Subject name is required"));
    }

    const existing = await prisma.subject.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existing) {
      return res
        .status(400)
        .json(apiResponse(false, "Subject with this name already exists"));
    }

    const subject = await prisma.subject.create({
      data: { name, description: description || "", isActive: true },
    });

    res
      .status(201)
      .json(apiResponse(true, "Subject created successfully", subject));
  } catch (error) {
    console.error("Create subject error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};
/**
 * Update subject
 */
const updateSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { name, description, isActive } = req.body;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject)
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));

    if (name && name !== subject.name) {
      const existing = await prisma.subject.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          id: { not: subjectId },
        },
      });
      if (existing)
        return res
          .status(400)
          .json(apiResponse(false, "Subject with this name already exists"));
    }

    const updated = await prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: name || subject.name,
        description:
          description !== undefined ? description : subject.description,
        isActive: isActive !== undefined ? isActive : subject.isActive,
      },
    });

    res.json(apiResponse(true, "Subject updated successfully", updated));
  } catch (error) {
    console.error("Update subject error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};
/**
 * Delete subject
 */
const deleteSubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        _count: { select: { videos: true, questions: true, topics: true } },
      },
    });

    if (!subject)
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));

    const totalUsage =
      subject._count.videos + subject._count.questions + subject._count.topics;

    if (totalUsage > 0)
      return res
        .status(400)
        .json(
          apiResponse(
            false,
            `Cannot delete subject. It is linked to other resources.`
          )
        );

    await prisma.subject.delete({ where: { id: subjectId } });
    res.json(apiResponse(true, "Subject deleted successfully"));
  } catch (error) {
    console.error("Delete subject error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Initialize Nigerian subjects
 */
const initializeSubjects = async (req, res) => {
  try {
    const nigerianSubjects = [
      {
        name: "Mathematics",
        description:
          "Core mathematics including algebra, geometry, trigonometry, and calculus",
      },
      {
        name: "English Language",
        description:
          "English comprehension, composition, grammar, and oral English",
      },
      {
        name: "Biology",
        description:
          "Study of living organisms, ecology, genetics, and human biology",
      },
      {
        name: "Chemistry",
        description:
          "Study of matter, chemical reactions, organic and inorganic chemistry",
      },
      {
        name: "Physics",
        description: "Study of matter, energy, motion, and fundamental forces",
      },
      {
        name: "Economics",
        description:
          "Study of production, distribution, and consumption of goods and services",
      },
      {
        name: "Commerce",
        description:
          "Study of trade, business operations, and commercial activities",
      },
      {
        name: "Accounting",
        description: "Financial accounting, cost accounting, and bookkeeping",
      },
      {
        name: "Government",
        description:
          "Study of political systems, governance, and civic education",
      },
      {
        name: "Literature in English",
        description: "Study of prose, poetry, drama, and literary appreciation",
      },
      {
        name: "Geography",
        description:
          "Physical and human geography, map reading, and environmental studies",
      },
      {
        name: "Agricultural Science",
        description:
          "Study of crop production, animal husbandry, and farming practices",
      },
      {
        name: "Civic Education",
        description:
          "Study of citizenship, rights, duties, and social responsibility",
      },
      {
        name: "Christian Religious Studies",
        description:
          "Study of Christian doctrine, biblical teachings, and religious practices",
      },
      {
        name: "Islamic Religious Studies",
        description:
          "Study of Islamic teachings, Quran, Hadith, and Islamic practices",
      },
      {
        name: "Yoruba",
        description: "Yoruba language, literature, and cultural studies",
      },
      {
        name: "Igbo",
        description: "Igbo language, literature, and cultural studies",
      },
      {
        name: "Hausa",
        description: "Hausa language, literature, and cultural studies",
      },
      {
        name: "French",
        description: "French language, comprehension, and composition",
      },
      {
        name: "Further Mathematics",
        description:
          "Advanced mathematics including complex numbers, vectors, and mechanics",
      },
      {
        name: "Computer Science/ICT",
        description:
          "Programming, computer systems, and information technology",
      },
      {
        name: "Technical Drawing",
        description:
          "Engineering drawing, orthographic projections, and design",
      },
      {
        name: "Food and Nutrition",
        description:
          "Study of nutrition, food preparation, and dietary planning",
      },
      {
        name: "Home Management",
        description:
          "Study of home economics, family life, and resource management",
      },
      {
        name: "Clothing and Textiles",
        description:
          "Study of fabric, fashion design, and garment construction",
      },
    ];

    let created = 0;
    let existing = 0;

    for (const subjectData of nigerianSubjects) {
      const exists = await prisma.subject.findFirst({
        where: { name: { equals: subjectData.name, mode: "insensitive" } },
      });

      if (!exists) {
        await prisma.subject.create({
          data: {
            name: subjectData.name,
            description: subjectData.description,
            isActive: true,
          },
        });
        created++;
      } else {
        existing++;
      }
    }

    res.json(
      apiResponse(
        true,
        `Subjects initialized: ${created} created, ${existing} already existed`,
        {
          created,
          existing,
          total: nigerianSubjects.length,
        }
      )
    );
  } catch (error) {
    console.error("Initialize subjects error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      paidUsers,
      totalSubjects,
      totalQuestions,
      totalVideos,
      totalMaterials,
      totalTests,
      totalNews,
      recentUsers,
      monthlyRevenue,
      weeklyTests,
      allTestResults,
    ] = await Promise.all([
      // Total users
      prisma.user.count({ where: { role: "USER" } }),

      prisma.user.count({ where: { hasPaid: true } }),

      // Total subjects
      prisma.subject.count({ where: { isActive: true } }),

      // Total questions
      prisma.question.count({ where: { isActive: true } }),

      // Total videos
      prisma.video.count({ where: { isActive: true } }),

      // Total materials
      prisma.material.count({ where: { isActive: true } }),

      // Total tests taken
      prisma.testResult.count(),

      // Total published news
      prisma.news.count({ where: { isPublished: true } }),

      // Recent users (FIXED: Changed select structure)
      prisma.user.findMany({
        where: { role: "USER" },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          hasPaid: true,
          paymentExpiry: true,
          createdAt: true,
        },
      }),

      // Monthly revenue
      prisma.payment.aggregate({
        where: {
          status: "SUCCESS",
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),

      // Weekly test activity
      prisma.testResult.count({
        where: {
          completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),

      // Get all test results to analyze popular subjects
      prisma.testResult.findMany({
        select: {
          subjects: true,
        },
        take: 1000,
        orderBy: { completedAt: "desc" },
      }),
    ]);

    // Calculate subject popularity
    const subjectCount = {};
    allTestResults.forEach((result) => {
      if (Array.isArray(result.subjects)) {
        result.subjects.forEach((subject) => {
          subjectCount[subject] = (subjectCount[subject] || 0) + 1;
        });
      }
    });

    // Sort subjects by popularity
    const popularSubjects = Object.entries(subjectCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([subject, count]) => ({ subject, count }));

    const stats = {
      users: {
        total: totalUsers,
        paid: paidUsers, 
        free: totalUsers - paidUsers,
      },
      content: {
        subjects: totalSubjects,
        questions: totalQuestions,
        videos: totalVideos,
        materials: totalMaterials,
        news: totalNews,
      },
      activity: {
        totalTests,
        weeklyTests,
        revenue: monthlyRevenue._sum.amount || 0,
        successfulPayments: monthlyRevenue._count || 0,
      },
      recentUsers,
      popularSubjects,
    };

    res.json(
      apiResponse(true, "Dashboard statistics retrieved successfully", stats)
    );
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

// Enhanced user management
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

    const where = { role: "USER" }; // Only get regular users, not admins

    if (role && role !== "all") {
      // Optional role filter - but keep as USER
      if (role === "admin") {
        where.role = "ADMIN";
      } else {
        where.role = "USER";
      }
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
        hasPaid: true,
        paymentType: true,
        paymentExpiry: true,
        createdAt: true,
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

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, hasPaid } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.USER_NOT_FOUND));
    }

    const updateData = {};

    if (role && ["USER", "ADMIN"].includes(role)) {
      updateData.role = role;
    }


    if (hasPaid !== undefined) {
      updateData.hasPaid = hasPaid;
      if (hasPaid && !user.paymentExpiry) {
        // Set payment expiry to 1 year from now if granting access
        updateData.paymentExpiry = new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        );
        updateData.paymentType = "YEARLY"; // Default to yearly when manually enabling
      } else if (!hasPaid) {
        updateData.paymentExpiry = null;
        updateData.paymentType = null;
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
        hasPaid: true,
        paymentType: true,
        paymentExpiry: true,
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

// Video upload handling
const uploadVideo = async (req, res) => {
  try {
    const { title, description, subjectId, isYouTube = false, url } = req.body;

    let videoData = { title, description, subjectId: subjectId || null };

    if (isYouTube && url) {
      const youtubeId = extractYouTubeId(url);
      if (!youtubeId)
        return res.status(400).json(apiResponse(false, "Invalid YouTube URL"));
      videoData.url = `https://www.youtube.com/embed/${youtubeId}`;
      videoData.thumbnail = getYouTubeThumbnail(youtubeId);
    } else if (req.file) {
      const uploadResult = await processVideoUpload(req.file);
      videoData.url = uploadResult.url;
      videoData.thumbnail = uploadResult.url;
    } else {
      return res
        .status(400)
        .json(apiResponse(false, "Video file or URL required"));
    }

    const video = await prisma.video.create({
      data: videoData,
      include: { subject: true },
    });

    res
      .status(201)
      .json(apiResponse(true, SUCCESS_MESSAGES.FILE_UPLOADED, video));
  } catch (error) {
    console.error("Upload video error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

// Material upload handling
const uploadMaterial = async (req, res) => {
  try {
    const { title, description, price, category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json(apiResponse(false, "File is required"));
    }

    const material = await prisma.material.create({
      data: {
        title,
        description,
        fileUrl: file.location || file.path,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype.split("/").pop(),
        price: parseFloat(price) || 0,
        category: category || "General",
      },
    });

    res
      .status(201)
      .json(apiResponse(true, SUCCESS_MESSAGES.FILE_UPLOADED, material));
  } catch (error) {
    console.error("Upload material error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

// News creation
const createNews = async (req, res) => {
  try {
    const { title, content, excerpt, category, isPublished = false } = req.body;
    const file = req.file;

    let imageUrl = null;
    if (file) {
      try {
        const uploadResult = await processImageUpload(file, "cravins/news");
        imageUrl = uploadResult.url;
      } catch (uploadError) {
        console.warn(
          "Image upload failed, proceeding without image:",
          uploadError.message
        );
      }
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 300),
        image: imageUrl,
        category: category || "General",
        source: "INTERNAL",
        isPublished: isPublished === "true" || isPublished === true,
        publishedAt:
          isPublished === "true" || isPublished === true ? new Date() : null,
      },
    });

    res
      .status(201)
      .json(apiResponse(true, "News article created successfully", news));
  } catch (error) {
    console.error("Create news error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

// News update
const updateNews = async (req, res) => {
  try {
    const { newsId } = req.params;
    const { title, content, excerpt, category, isPublished } = req.body;
    const file = req.file;

    const existingNews = await prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!existingNews) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    const updateData = { title, content, excerpt, category };

    if (file) {
      try {
        const uploadResult = await processImageUpload(file, "cravins/news");
        updateData.image = uploadResult.url;
      } catch (uploadError) {
        console.warn("Image upload failed during update:", uploadError.message);
      }
    }

    if (isPublished !== undefined) {
      updateData.isPublished = isPublished === "true" || isPublished === true;
      if (updateData.isPublished && !existingNews.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedNews = await prisma.news.update({
      where: { id: newsId },
      data: updateData,
    });

    res.json(
      apiResponse(true, "News article updated successfully", updatedNews)
    );
  } catch (error) {
    console.error("Update news error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

// Get admin videos
const getAdminVideos = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const query = {
      where: { isActive: true },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    };

    const paginatedQuery = paginate(query, parseInt(page), parseInt(limit));

    const [videos, total] = await Promise.all([
      prisma.video.findMany(paginatedQuery),
      prisma.video.count({ where: { isActive: true } }),
    ]);

    const formattedResults = formatPaginationResponse(
      videos,
      total,
      parseInt(page),
      parseInt(limit)
    );

    res.json(
      apiResponse(true, "Videos retrieved successfully", formattedResults)
    );
  } catch (error) {
    console.error("Get admin videos error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

// Get admin materials
const getAdminMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const query = {
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    };

    const paginatedQuery = paginate(query, parseInt(page), parseInt(limit));

    const [materials, total] = await Promise.all([
      prisma.material.findMany(paginatedQuery),
      prisma.material.count({ where: { isActive: true } }),
    ]);

    const formattedResults = formatPaginationResponse(
      materials,
      total,
      parseInt(page),
      parseInt(limit)
    );

    res.json(
      apiResponse(true, "Materials retrieved successfully", formattedResults)
    );
  } catch (error) {
    console.error("Get admin materials error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

// Get admin news
const getAdminNews = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const query = {
      orderBy: { createdAt: "desc" },
    };

    const paginatedQuery = paginate(query, parseInt(page), parseInt(limit));

    const [news, total] = await Promise.all([
      prisma.news.findMany(paginatedQuery),
      prisma.news.count(),
    ]);

    const formattedResults = formatPaginationResponse(
      news,
      total,
      parseInt(page),
      parseInt(limit)
    );

    res.json(
      apiResponse(true, "News retrieved successfully", formattedResults)
    );
  } catch (error) {
    console.error("Get admin news error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

// Delete handlers
const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    await prisma.video.update({
      where: { id: videoId },
      data: { isActive: false },
    });

    res.json(apiResponse(true, "Video deleted successfully"));
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });
    if (!material) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    await prisma.material.update({
      where: { id: materialId },
      data: { isActive: false },
    });

    res.json(apiResponse(true, "Material deleted successfully"));
  } catch (error) {
    console.error("Delete material error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

const deleteNews = async (req, res) => {
  try {
    const { newsId } = req.params;

    const news = await prisma.news.findUnique({ where: { id: newsId } });
    if (!news) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    // Delete related views first
    await prisma.newsView.deleteMany({ where: { newsId } });

    // Then delete the news article
    await prisma.news.delete({ where: { id: newsId } });

    res.json(apiResponse(true, "News article deleted successfully"));
  } catch (error) {
    console.error("Delete news error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

// Update video
const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, url, subjectId } = req.body;

    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    const updateData = {
      title,
      description,
      subjectId: subjectId || null,
    };

    if (url && url !== video.url) {
      if (url.includes("youtube")) {
        const youtubeId = extractYouTubeId(url);
        if (youtubeId) {
          updateData.url = `https://www.youtube.com/embed/${youtubeId}`;
          updateData.thumbnail = getYouTubeThumbnail(youtubeId);
        }
      } else {
        updateData.url = url;
      }
    }

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: updateData,
      include: { subject: true },
    });

    res.json(apiResponse(true, "Video updated successfully", updatedVideo));
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

// Update material
const updateMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { title, description, price, category } = req.body;

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });
    if (!material) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    const updatedMaterial = await prisma.material.update({
      where: { id: materialId },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : material.price,
        category: category || material.category,
      },
    });

    res.json(
      apiResponse(true, "Material updated successfully", updatedMaterial)
    );
  } catch (error) {
    console.error("Update material error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting admin users
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json(
        apiResponse(false, ERROR_MESSAGES.USER_NOT_FOUND)
      );
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json(
        apiResponse(false, 'Cannot delete admin users')
      );
    }

    // Delete related data first
    await prisma.$transaction([
      prisma.testResult.deleteMany({ where: { userId } }),
      prisma.materialDownload.deleteMany({ where: { userId } }),
      prisma.newsView.deleteMany({ where: { userId } }),
      prisma.chatSession.deleteMany({ where: { userId } }),
      prisma.payment.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    res.json(apiResponse(true, 'User deleted successfully'));
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  uploadVideo,
  uploadMaterial,
  createNews,
  updateNews,
  deleteVideo,
  deleteMaterial,
  deleteNews,
  getAdminVideos,
  getAdminMaterials,
  getAdminNews,
  updateVideo,
  updateMaterial,
  getAnalytics: require("./userController").getAnalytics || (() => {}),
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  initializeSubjects,
  deleteUser,
};
