const multer = require('multer');

// Store files in memory as Buffers so we can stream directly to Cloudinary
const storage = multer.memoryStorage();

// Validate image file formats
function fileFilter(req, file, cb) {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed.'), false);
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per image limit
    files: 30, // maximum 30 images in a single batch
  },
  fileFilter,
});

module.exports = upload;

