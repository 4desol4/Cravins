const {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multer = require("multer");

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({ storage: multer.memoryStorage() });

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

const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });
  return await s3Client.send(command);
};

// FIXED: Generate signed URL with proper S3 client
const generateSignedUrl = async (key, expires = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    // Generate signed URL with s3Client
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expires,
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
};

module.exports = {
  s3Client,
  upload,
  uploadToS3,
  deleteFromS3,
  getSignedUrl: generateSignedUrl, // Export with proper name
};
