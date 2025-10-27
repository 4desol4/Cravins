const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to cloudinary
 * @param {string} filePath - Path to the file
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Object>}
 */
const uploadImage = async (filePath, folder = 'cravins') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload video to cloudinary
 * @param {string} filePath - Path to the video file
 * @param {string} folder - Cloudinary folder
 * @returns {Promise<Object>}
 */
const uploadVideo = async (filePath, folder = 'cravins/videos') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'video',
      chunk_size: 6000000, // 6MB chunks
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary video upload failed: ${error.message}`);
  }
};

/**
 * Delete file from cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>}
 */
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  deleteFile,
};