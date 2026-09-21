const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Only image files (jpg, png, webp, gif) are allowed.'));
  }
  cb(null, true);
}

function buildStorage() {
  
  if (process.env.CLOUDINARY_URL) {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    // cloudinary.config() with no args reads CLOUDINARY_URL from the environment.
    cloudinary.config();

    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'airbnb-clone-listings',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      },
    });
  }

  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, LOCAL_UPLOAD_DIR),
    filename: (req, file, cb) => {
      const unique = crypto.randomBytes(8).toString('hex');
      cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
    },
  });
}

const upload = multer({
  storage: buildStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
