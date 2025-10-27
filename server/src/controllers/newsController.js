const prisma = require('../config/database');
const { processImageUpload } = require('../services/fileService');
const { apiResponse, paginate, formatPaginationResponse, calculateReadingTime } = require('../utils/helpers');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

/**
 * Get all news articles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, source } = req.query;

    const where = {
      isPublished: true,
    };

    if (category) {
      where.category = category;
    }

    if (source) {
      where.source = source;
    }

    const query = {
      where,
      select: {
        id: true,
        title: true,
        excerpt: true,
        image: true,
        category: true,
        source: true,
        publishedAt: true,
        views: true,
      },
      orderBy: { publishedAt: 'desc' },
    };

    const paginatedQuery = paginate(query, parseInt(page), parseInt(limit));

    const [news, total] = await Promise.all([
      prisma.news.findMany(paginatedQuery),
      prisma.news.count({ where }),
    ]);

    const formattedResults = formatPaginationResponse(
      news,
      total,
      parseInt(page),
      parseInt(limit)
    );

    res.json(
      apiResponse(true, 'News articles retrieved successfully', formattedResults)
    );
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

/**
 * Get single news article
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNewsArticle = async (req, res) => {
  try {
    const { newsId } = req.params;

    const article = await prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!article || !article.isPublished) {
      return res.status(404).json(
        apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND)
      );
    }

    // Increment view count
    await prisma.news.update({
      where: { id: newsId },
      data: {
        views: { increment: 1 },
      },
    });

    // Track user view if authenticated
    if (req.user) {
      await prisma.newsView.upsert({
        where: {
          userId_newsId: {
            userId: req.user.id,
            newsId,
          },
        },
        update: {
          viewedAt: new Date(),
        },
        create: {
          userId: req.user.id,
          newsId,
        },
      });
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(article.content);

    res.json(
      apiResponse(true, 'News article retrieved successfully', {
        ...article,
        readingTime,
      })
    );
  } catch (error) {
    console.error('Get news article error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

/**
 * Get latest news for dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLatestNews = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const news = await prisma.news.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        image: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: parseInt(limit),
    });

    res.json(
      apiResponse(true, 'Latest news retrieved successfully', news)
    );
  } catch (error) {
    console.error('Get latest news error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

/**
 * Create news article (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createNews = async (req, res) => {
  try {
    const { title, content, excerpt, category, isPublished = false } = req.body;
    const file = req.file;

    let imageUrl = null;
    if (file) {
      const uploadResult = await processImageUpload(file, 'cravins/news');
      imageUrl = uploadResult.url;
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        excerpt: excerpt || content.substring(0, 300),
        image: imageUrl,
        category,
        source: 'INTERNAL',
        isPublished: isPublished === 'true',
        publishedAt: isPublished === 'true' ? new Date() : null,
      },
    });

    res.status(201).json(
      apiResponse(true, 'News article created successfully', news)
    );
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

/**
 * Update news article (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateNews = async (req, res) => {
  try {
    const { newsId } = req.params;
    const { title, content, excerpt, category, isPublished } = req.body;
    const file = req.file;

    const existingNews = await prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!existingNews) {
      return res.status(404).json(
        apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND)
      );
    }

    const updateData = {
      title,
      content,
      excerpt,
      category,
    };

    // Handle image upload
    if (file) {
      const uploadResult = await processImageUpload(file, 'cravins/news');
      updateData.image = uploadResult.url;
    }

    // Handle publishing
    if (isPublished !== undefined) {
      updateData.isPublished = isPublished === 'true';
      if (updateData.isPublished && !existingNews.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedNews = await prisma.news.update({
      where: { id: newsId },
      data: updateData,
    });

    res.json(
      apiResponse(true, 'News article updated successfully', updatedNews)
    );
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

/**
 * Delete news article (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteNews = async (req, res) => {
  try {
    const { newsId } = req.params;

    const news = await prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!news) {
      return res.status(404).json(
        apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND)
      );
    }

    // Hard delete news and related views
    await prisma.newsView.deleteMany({
      where: { newsId },
    });

    await prisma.news.delete({
      where: { id: newsId },
    });

    res.json(
      apiResponse(true, 'News article deleted successfully')
    );
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

/**
 * Get pending external news (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPendingExternalNews = async (req, res) => {
  try {
    // This would typically fetch from an external API
    // For now, return mock data
    const pendingNews = [
      {
        id: 'ext_1',
        title: 'Education Ministry Announces New Policy',
        summary: 'The Federal Ministry of Education has announced new policies for secondary schools...',
        source: 'Ministry of Education',
        image: 'https://example.com/image1.jpg',
        externalUrl: 'https://education.gov.ng/news/new-policy',
      },
      {
        id: 'ext_2',
        title: 'JAMB Releases 2024 Results',
        summary: 'Joint Admissions and Matriculation Board has released results for 2024 candidates...',
        source: 'JAMB',
        image: 'https://example.com/image2.jpg',
        externalUrl: 'https://jamb.gov.ng/news/results-2024',
      },
    ];

    res.json(
      apiResponse(true, 'Pending external news retrieved successfully', pendingNews)
    );
  } catch (error) {
    console.error('Get pending external news error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

/**
 * Approve external news (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const approveExternalNews = async (req, res) => {
  try {
    const { externalId, title, content, excerpt, category, image, externalUrl } = req.body;

    const news = await prisma.news.create({
      data: {
        title,
        content,
        excerpt,
        image,
        category,
        source: 'EXTERNAL',
        externalUrl,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    res.status(201).json(
      apiResponse(true, 'External news approved and published', news)
    );
  } catch (error) {
    console.error('Approve external news error:', error);
    res.status(500).json(
      apiResponse(false, ERROR_MESSAGES.SERVER_ERROR)
    );
  }
};

// Get news statistics
const getNewsStats = async (req, res) => {
  try {
    const totalArticles = await prisma.news.count();
    const todayArticles = await prisma.news.count({
      where: {
        publishedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const totalViewsAgg = await prisma.news.aggregate({
      _sum: { views: true },
    });

    res.json({
      success: true,
      message: "News stats retrieved successfully",
      data: {
        totalArticles,
        todayArticles,
        totalViews: totalViewsAgg._sum.views || 0,
      },
    });
  } catch (error) {
    console.error("Get news stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve news stats",
    });
  }
};


module.exports = {
  getNews,
  getNewsArticle,
  getLatestNews,
  createNews,
  updateNews,
  deleteNews,
  getPendingExternalNews,
  approveExternalNews,
  getNewsStats,
};