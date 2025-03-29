const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(__dirname, '..', 'public', 'courses');

    if (file.fieldname === 'coverImage') {
      uploadPath = path.join(uploadPath, 'covers');
    } else if (file.fieldname === 'promoVideo') {
      uploadPath = path.join(uploadPath, 'promo-videos');
    } else if (file.fieldname === 'sessionVideo') {
      uploadPath = path.join(__dirname, '..', 'public', 'sessions', 'videos');
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const ext = path.extname(file.originalname);
    cb(null, uniqueName + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverImage' && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else if (
    file.fieldname === 'promoVideo' &&
    file.mimetype.startsWith('video/')
  ) {
    cb(null, true);
  } else if (
    file.fieldname === 'sessionVideo' &&
    file.mimetype.startsWith('video/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only images and videos are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
});

module.exports = upload;
