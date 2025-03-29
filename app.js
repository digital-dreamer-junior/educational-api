const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const userRoutes = require('./routes/v1/userRoutes');
const categoryRoutes = require('./routes/v1/categoryRoutes');
const courseRoutes = require('./routes/v1/courseRoutes');
const reviewRoutes = require('./routes/v1/reviewRoutes');
const enrollmentRoutes = require('./routes/v1/enrollmentRoutes');
const contactRoutes = require('./routes/v1/contactRoutes');
const newsLetterRoutes = require('./routes/v1/newsLetterRoutes');
const notificationRoutes = require('./routes/v1/notificationRoutes');
const searchRoutes = require('./routes/v1/searchRoutes');
const discountCodeRoutes = require('./routes/v1/discountCodeRoutes');
const ticketRoutes = require('./routes/v1/ticketRoutes');
const globalErrorHandler = require('./controllers/v1/errorController');
const AppError = require('./utils/appError');
const {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions,
} = require('./configs/swgger');

const app = express();

// Use Swagger UI to serve API documentation at /api-docs
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);

// Other API routes
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/courses/covers'); // Path to store uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// Filter only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

// Configure Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
});

// // Apply Multer only for `coverImage`
// app.use(upload.single('coverImage'));

// Serve static files for course covers
app.use(
  '/courses/covers',
  express.static(path.resolve(__dirname, 'public/courses/covers'))
);

// *) GLOBAL MIDDLEWARES

// Enable CORS (We can specify allowed origins if needed)
app.use(cors());

app.options('*', cors());

// // Replace body-parser with built-in Express methods
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ROUTES
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/newsLetters', newsLetterRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/discountCodes', discountCodeRoutes);
app.use('/api/v1/tickets', ticketRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler (must be last)
app.use(globalErrorHandler);

module.exports = app;
