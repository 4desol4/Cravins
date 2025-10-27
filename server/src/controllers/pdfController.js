const prisma = require("../config/database");
const { processDocumentUpload } = require("../services/fileService");
const { uploadToS3, getSignedUrl } = require("../config/aws-s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const {
  apiResponse,
  paginate,
  formatPaginationResponse,
} = require("../utils/helpers");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../utils/constants");

/**
 * Get all materials (no pricing shown)
 */
const getMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;

    const where = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const query = {
      where,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        fileType: true,
        downloads: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    };

    const paginatedQuery = paginate(query, parseInt(page), parseInt(limit));

    const [materials, total] = await Promise.all([
      prisma.material.findMany(paginatedQuery),
      prisma.material.count({ where }),
    ]);

    // Check user access status
    const userHasPaid =
      req.user &&
      (req.user.role === "ADMIN" ||
        (req.user.hasPaid &&
          (!req.user.paymentExpiry ||
            new Date() <= new Date(req.user.paymentExpiry))));

    // Add access info to materials
    const materialsWithAccess = materials.map((material) => ({
      ...material,
      canAccess: userHasPaid,
      requiresPayment: !userHasPaid,
    }));

    const formattedResults = formatPaginationResponse(
      materialsWithAccess,
      total,
      parseInt(page),
      parseInt(limit)
    );

    res.json(
      apiResponse(true, "Materials retrieved successfully", {
        ...formattedResults,
        userHasAccess: userHasPaid,
      })
    );
  } catch (error) {
    console.error("Get materials error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Get single material
 */
const getMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material || !material.isActive) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    const userHasPaid =
      req.user &&
      (req.user.role === "ADMIN" ||
        (req.user.hasPaid &&
          (!req.user.paymentExpiry ||
            new Date() <= new Date(req.user.paymentExpiry))));

    res.json(
      apiResponse(true, "Material retrieved successfully", {
        ...material,
        canAccess: userHasPaid,
        requiresPayment: !userHasPaid,
      })
    );
  } catch (error) {
    console.error("Get material error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Download material (requires payment)
 */
const downloadMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

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
          message: "Please complete payment to download materials",
        })
      );
    }

    const material = await prisma.material.findUnique({
      where: { id: materialId },
    });

    if (!material || !material.isActive) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND));
    }

    console.log('Material fileUrl:', material.fileUrl);

    // Extract S3 key from file URL
    let s3Key;
    
    if (material.fileUrl.includes('s3.amazonaws.com')) {
      // Format: https://bucket.s3.region.amazonaws.com/folder/filename
      const urlParts = material.fileUrl.split('.amazonaws.com/');
      s3Key = urlParts[1];
    } else if (material.fileUrl.includes('amazonaws.com')) {
      // Alternative format
      const url = new URL(material.fileUrl);
      s3Key = url.pathname.substring(1); // Remove leading slash
    } else {
      // Assume it's just the key
      s3Key = material.fileUrl;
    }

    console.log('Extracted S3 key:', s3Key);

    // Validate S3 configuration
    if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) {
      console.error('Missing AWS configuration');
      return res.status(500).json(
        apiResponse(false, 'Server configuration error: AWS not configured')
      );
    }

    // Generate signed URL for download
    let downloadUrl;
    try {
      downloadUrl = await getSignedUrl(s3Key, 3600);
      console.log('Generated signed URL successfully');
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return res.status(500).json(
        apiResponse(false, `Failed to generate download URL: ${error.message}`)
      );
    }

    // Track download in parallel
    try {
      await Promise.all([
        prisma.material.update({
          where: { id: materialId },
          data: { downloads: { increment: 1 } },
        }),
        prisma.materialDownload.create({
          data: {
            userId: req.user.id,
            materialId,
          },
        }),
      ]);
    } catch (trackingError) {
      console.error('Error tracking download:', trackingError);
      // Continue even if tracking fails
    }

    // Return download information
    res.json(
      apiResponse(true, "Download URL generated successfully", {
        downloadUrl,
        fileName: material.fileName,
        fileSize: material.fileSize,
        fileType: material.fileType,
        expiresIn: 3600,
      })
    );
  } catch (error) {
    console.error("Download material error:", error);
    res.status(500).json(
      apiResponse(false, `Download failed: ${error.message}`)
    );
  }
};

/**
 * Get user's downloaded materials
 */
const getDownloadedMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = {
      where: { userId: req.user.id },
      include: {
        material: {
          select: {
            id: true,
            title: true,
            description: true,
            fileName: true,
            fileSize: true,
            fileType: true,
            category: true,
          },
        },
      },
      orderBy: { downloadedAt: "desc" },
    };

    const paginatedQuery = paginate(query, parseInt(page), parseInt(limit));

    const [downloads, total] = await Promise.all([
      prisma.materialDownload.findMany(paginatedQuery),
      prisma.materialDownload.count({ where: { userId: req.user.id } }),
    ]);

    const formattedResults = formatPaginationResponse(
      downloads,
      total,
      parseInt(page),
      parseInt(limit)
    );

    res.json(
      apiResponse(
        true,
        "Downloaded materials retrieved successfully",
        formattedResults
      )
    );
  } catch (error) {
    console.error("Get downloaded materials error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Upload material (Admin only)
 */
const uploadMaterial = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json(apiResponse(false, "File is required"));
    }

    // Upload to S3
    const s3Result = await uploadToS3(
      file.buffer,
      file.originalname,
      file.mimetype,
      "materials"
    );

    const material = await prisma.material.create({
      data: {
        title,
        description,
        fileUrl: s3Result.url,
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype.split("/").pop(),
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

/**
 * Update material (Admin only)
 */
const updateMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { title, description, category } = req.body;

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
        title: title || material.title,
        description:
          description !== undefined ? description : material.description,
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

/**
 * Delete material (Admin only)
 */
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

    // Soft delete
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

/**
 * Get material statistics (Admin)
 */
const getMaterialStats = async (req, res) => {
  try {
    const [totalMaterials, totalDownloads, downloadsByCategory] =
      await Promise.all([
        prisma.material.count({ where: { isActive: true } }),
        prisma.materialDownload.count(),
        prisma.material.groupBy({
          by: ["category"],
          where: { isActive: true },
          _count: { id: true },
          _sum: { downloads: true },
        }),
      ]);

    res.json(
      apiResponse(true, "Material statistics retrieved successfully", {
        totalMaterials,
        totalDownloads,
        downloadsByCategory: downloadsByCategory.map((cat) => ({
          category: cat.category,
          materialsCount: cat._count.id,
          totalDownloads: cat._sum.downloads || 0,
        })),
      })
    );
  } catch (error) {
    console.error("Get material stats error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

module.exports = {
  getMaterials,
  getMaterial,
  downloadMaterial,
  getDownloadedMaterials,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialStats,
};
