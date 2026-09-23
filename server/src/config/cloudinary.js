const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer to Cloudinary using upload_stream.
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {Object} options - Additional Cloudinary upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
function uploadStream(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'valluvam/gallery',
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/**
 * Safely delete a Cloudinary asset by publicId.
 * Catches and logs errors so failures never corrupt database operations.
 * @param {string} publicId - Cloudinary asset public ID
 */
async function deleteCloudinaryAsset(publicId) {
  if (!publicId || typeof publicId !== 'string' || !publicId.trim()) return;
  try {
    const result = await cloudinary.uploader.destroy(publicId.trim());
    return result;
  } catch (err) {
    console.error(`[Cloudinary] Failed to delete asset ${publicId}:`, err.message);
  }
}

module.exports = {
  cloudinary,
  uploadStream,
  deleteCloudinaryAsset,
};

