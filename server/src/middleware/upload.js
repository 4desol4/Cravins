const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer memory storage
const memoryStorage = multer.memoryStorage();

// Filters
const imageFilter = (req, file, cb) =>
  file.mimetype.startsWith("image/")
    ? cb(null, true)
    : cb(new Error("Only image files are allowed"), false);

const videoFilter = (req, file, cb) =>
  file.mimetype.startsWith("video/")
    ? cb(null, true)
    : cb(new Error("Only video files are allowed"), false);

const documentFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(
        new Error(
          "Only documents (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX) are allowed"
        ),
        false
      );
};

// Upload configs
const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadVideo = multer({
  storage: memoryStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

const uploadDocument = multer({
  storage: memoryStorage,
  fileFilter: documentFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const uploadAny = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Function to push file to S3
const uploadToS3 = async (
  fileBuffer,
  fileName,
  contentType,
  folder = "materials"
) => {
  const key = `${folder}/${Date.now()}_${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
  return {
    key,
    url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  };
};

module.exports = {
  uploadImage,
  uploadVideo,
  uploadDocument,
  uploadAny,
  uploadToS3,
};
