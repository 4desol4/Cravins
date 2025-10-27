const prisma = require("../config/database");
const {
  processVideoUpload,
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
 * Get all videos with filtering
 */
const getVideos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      subject,
      search,
      sortBy = "recent",
    } = req.query;

    const where = {
      isActive: true,
    };

    // Filter by subject
    if (subject) {
      where.subjectId = subject;
    }

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Sorting
    let orderBy;
    switch (sortBy) {
      case "popular":
        orderBy = { views: "desc" };
        break;
      case "title":
        orderBy = { title: "asc" };
        break;
      case "duration":
        orderBy = { duration: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const query = {
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
    };

    const paginatedQuery = paginate(query, parseInt(page), parseInt(limit));

    const [videos, total] = await Promise.all([
      prisma.video.findMany(paginatedQuery),
      prisma.video.count({ where }),
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
    console.error("Get videos error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Get single video and increment view count
 */
const getVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        subject: true,
      },
    });

    if (!video || !video.isActive) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    // Increment view count
    await prisma.video.update({
      where: { id: videoId },
      data: {
        views: { increment: 1 },
      },
    });

    res.json(apiResponse(true, "Video retrieved successfully", video));
  } catch (error) {
    console.error("Get video error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Upload video file (Admin only)
 */
const uploadVideo = async (req, res) => {
  try {
    const { title, description, subjectId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json(apiResponse(false, "Video file is required"));
    }

    // Upload video to Cloudinary
    const uploadResult = await processVideoUpload(file);

    // Create video record
    const video = await prisma.video.create({
      data: {
        title,
        description: description || "",
        url: uploadResult.url,
        thumbnail: uploadResult.url.replace(/\.[^/.]+$/, ".jpg"),
        duration: uploadResult.duration || null,
        subjectId: subjectId || null,
      },
      include: {
        subject: true,
      },
    });

    res
      .status(201)
      .json(apiResponse(true, SUCCESS_MESSAGES.FILE_UPLOADED, video));
  } catch (error) {
    console.error("Upload video error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Add YouTube video (Admin only)
 */
const addYouTubeVideo = async (req, res) => {
  try {
    const { title, description, url, subjectId } = req.body;

    // Extract YouTube ID
    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      return res.status(400).json(apiResponse(false, "Invalid YouTube URL"));
    }

    // Generate embed URL and thumbnail
    const embedUrl = `https://www.youtube.com/embed/${youtubeId}`;
    const thumbnail = getYouTubeThumbnail(youtubeId);

    // Create video record
    const video = await prisma.video.create({
      data: {
        title,
        description: description || "",
        url: embedUrl,
        thumbnail,
        subjectId: subjectId || null,
      },
      include: {
        subject: true,
      },
    });

    res
      .status(201)
      .json(apiResponse(true, "YouTube video added successfully", video));
  } catch (error) {
    console.error("Add YouTube video error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Update video (Admin only)
 */
const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, url, subjectId } = req.body;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    const updateData = {
      title,
      description: description || "",
      subjectId: subjectId || null,
    };

    // If URL is being updated
    if (url && url !== video.url) {
      // Check if it's a YouTube URL
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const youtubeId = extractYouTubeId(url);
        if (youtubeId) {
          updateData.url = `https://www.youtube.com/embed/${youtubeId}`;
          updateData.thumbnail = getYouTubeThumbnail(youtubeId);
        } else {
          return res
            .status(400)
            .json(apiResponse(false, "Invalid YouTube URL"));
        }
      } else {
        // Direct video URL
        updateData.url = url;
      }
    }

    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: updateData,
      include: {
        subject: true,
      },
    });

    res.json(apiResponse(true, "Video updated successfully", updatedVideo));
  } catch (error) {
    console.error("Update video error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Delete video permanently (Admin only)
 */
const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    // Permanently delete the video
    await prisma.video.delete({
      where: { id: videoId },
    });

    res.json(apiResponse(true, "Video deleted successfully"));
  } catch (error) {
    console.error("Delete video error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

module.exports = {
  getVideos,
  getVideo,
  uploadVideo,
  addYouTubeVideo,
  updateVideo,
  deleteVideo,
};
