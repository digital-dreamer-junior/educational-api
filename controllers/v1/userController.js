const multer = require('multer');
const sharp = require('sharp');

const User = require('../../models/userModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('./handlerFactory');

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

/**
 * File filter for multer to accept only image files
 */
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

/**
 * Resize and process user uploaded photo
 * Converts image to JPEG format and resizes to 500x500
 */
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

/**
 * Filter object properties based on allowed fields
 * @param {Object} obj - Object to filter
 * @param {...string} allowedFields - Fields to keep in the filtered object
 * @returns {Object} Filtered object
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * Middleware to get current user's data
 */
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

/**
 * Update current user's data
 * @route PATCH /api/v1/users/updateMe
 * @access Private
 */
exports.updateMe = catchAsync(async (req, res, next) => {
  // Prevent password update through this route
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password updates.', 400));
  }

  // Filter allowed fields
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'username',
    'phone'
  );
  if (req.file) filteredBody.photo = req.file.filename;

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found!', 404));

  Object.assign(user, filteredBody);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * Deactivate current user account
 * @route DELETE /api/v1/users/deleteMe
 * @access Private
 */
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Ban a user by adding their phone number to ban list
 * @route POST /api/v1/users/:id/ban
 * @access Private (Admin only)
 */
exports.banUser = catchAsync(async (req, res, next) => {
  const mainUser = await User.findOne({ _id: req.params.id }).lean();

  if (!mainUser) {
    return next(new AppError('User not found.', 404));
  }

  const banUserResult = await banUserModel.create({ phone: mainUser.phone });

  if (banUserResult) {
    return res.status(200).json({ message: 'User banned successfully.' });
  }

  return next(new AppError('Failed to ban user.', 400));
});

// Factory functions for CRUD operations
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
