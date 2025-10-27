const fs = require('fs');
const path = require('path');
const { uploadImage, uploadVideo, uploadToS3, deleteFromS3 } = require('../config/cloudinary');
const { cloudinary } = require('../config/cloudinary');

/**
 * Process and upload image file
 * @param {Object} file - Multer file object
 * @param {string} folder - Upload folder
 * @returns {Promise<Object>}
 */
const processImageUpload = async (file, folder = 'cravins') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create temp file
    const tempPath = path.join(__dirname, '../../temp', file.originalname);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(tempPath, file.buffer);

    // Upload to Cloudinary
    const result = await uploadImage(tempPath, folder);

    // Clean up temp file
    fs.unlinkSync(tempPath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

/**
 * Process and upload video file
 * @param {Object} file - Multer file object
 * @param {string} folder - Upload folder
 * @returns {Promise<Object>}
 */
const processVideoUpload = async (file, folder = 'cravins/videos') => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const tempPath = path.join(__dirname, '../../temp', file.originalname);
    
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(tempPath, file.buffer);

    const result = await uploadVideo(tempPath, folder);

    fs.unlinkSync(tempPath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
      size: result.bytes,
    };
  } catch (error) {
    throw new Error(`Video upload failed: ${error.message}`);
  }
};

/**
 * Process and upload document to S3
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>}
 */
const processDocumentUpload = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const result = await uploadToS3(
      file.buffer,
      file.originalname,
      file.mimetype
    );

    return {
      url: result.Location,
      key: result.Key,
      size: file.size,
      type: file.mimetype,
      originalName: file.originalname,
    };
  } catch (error) {
    throw new Error(`Document upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<boolean>}
 */
const deleteCloudinaryFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Failed to delete Cloudinary file:', error);
    return false;
  }
};

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>}
 */
const deleteS3File = async (key) => {
  try {
    await deleteFromS3(key);
    return true;
  } catch (error) {
    console.error('Failed to delete S3 file:', error);
    return false;
  }
};

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null}
 */
const extractYouTubeId = (url) => {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/,
    /^[a-zA-Z0-9_-]{11}$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }

  return null;
};

/**
 * Get YouTube video thumbnail
 * @param {string} videoId - YouTube video ID
 * @returns {string}
 */
const getYouTubeThumbnail = (videoId) => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

module.exports = {
  processImageUpload,
  processVideoUpload,
  processDocumentUpload,
  deleteCloudinaryFile,
  deleteS3File,
  extractYouTubeId,
  getYouTubeThumbnail,
};

