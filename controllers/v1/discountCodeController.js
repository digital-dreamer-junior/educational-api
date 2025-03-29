const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('./handlerFactory');
const DiscountCode = require('../../models/discountCodeModel');
const Course = require('../../models/courseModel');

// 1. Create a discount code
exports.createDiscountCode = catchAsync(async (req, res, next) => {
  // 2. Get data from the request body
  const {
    code,
    discountPercentage,
    course,
    maxUsage,
    expiresAt,
    minPurchaseAmount,
  } = req.body;

  // 3. Check if the course exists
  const courseExists = await Course.findById(course);
  if (!courseExists) {
    return next(new AppError('Course not found.', 404));
  }

  // . Check if the discount code already exists
  const existingCode = await DiscountCode.findOne({ code });
  if (existingCode) {
    return next(new AppError('Discount code already exists.', 400)); // Change status to 400 for duplicate entry
  }

  // 4. Create the discount code with the current user as the creator
  const discountCode = await DiscountCode.create({
    code,
    discountPercentage,
    course,
    maxUsage,
    expiresAt,
    minPurchaseAmount,
    createdBy: req.user._id, // Logged-in user is the creator of the code
  });

  // 5. Return the discount code as response
  res.status(201).json({
    status: 'success',
    data: discountCode,
  });
});

exports.setGeneralDiscount = catchAsync(async (req, res, next) => {
  const { discount } = req.body;

  // Validate input
  if (typeof discount !== 'number' || discount < 0 || discount > 100) {
    return next(
      new AppError('Invalid discount value. It must be between 0 and 100.', 400)
    );
  }

  // Update all courses
  const result = await Course.updateMany({}, { discount });

  // Check if any course was updated
  if (result.modifiedCount === 0) {
    return next(new AppError('No courses were updated', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Discounts set successfully for all courses',
    modifiedCourses: result.modifiedCount,
  });
});

exports.getAllDiscountCodes = catchAsync(async (req, res, next) => {
  const discountCodes = await DiscountCode.find({}, '-__v')
    .lean()
    .populate({
      path: 'course',
      select: 'title',
    })
    .populate('createdBy', 'name');

  res.status(200).json({
    status: 'success',
    results: discountCodes.length,
    data: discountCodes,
  });
});

exports.deleteDiscountCode = factory.deleteOne(DiscountCode);

exports.updateDiscountCodes = factory.updateOne(DiscountCode);

// Apply Discount Code
exports.applyDiscountCode = catchAsync(async (req, res, next) => {
  const { code, courseId } = req.body; // Get the discount code and courseId from the request
  const userId = req.user._id; // Get userId from the token (assuming it's set)

  // 1. Find the course by ID to get the totalPrice
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found.', 404)); // If course not found, return an error
  }

  const totalPrice = course.price - (course.price * course.discount) / 100;

  // 2. Check if the discount code exists and is valid
  const discountCode = await DiscountCode.findOne({
    code, // the discount code the user submitted
    status: 'active', // Ensure the discount code is still active
    expiresAt: { $gt: Date.now() }, // Ensure the discount code has not expired
    course: courseId, // Ensure the discount code is for the correct course
  });

  if (!discountCode) {
    return next(
      new AppError('Invalid or expired discount code for this course.', 400)
    );
  }

  // 3. Check if the user has already used this discount code
  if (discountCode.usedCount >= discountCode.maxUsage) {
    return next(
      new AppError(
        'This discount code has reached its maximum usage limit.',
        400
      )
    );
  }

  // 4. Validate that the user has not used this code before
  // Check if the discount code is used by the current user
  const userHasUsed = discountCode.usedCount > 0;
  if (userHasUsed) {
    return next(new AppError('You have already used this discount code.', 400));
  }

  // 5. Validate the minimum purchase amount (if any)
  if (discountCode.minPurchaseAmount > totalPrice) {
    return next(
      new AppError(
        `Your purchase total is less than the required minimum of ${discountCode.minPurchaseAmount}.`,
        400
      )
    );
  }

  // 6. Apply the discount to the total price
  const discountedPrice =
    totalPrice - totalPrice * (discountCode.discountPercentage / 100);

  // 7. Update the used count (track how many times this code has been used)
  discountCode.usedCount += 1;
  await discountCode.save();

  // 8. Return the discounted price to the user
  res.status(200).json({
    status: 'success',
    discountedPrice,
    message: `Discount of ${discountCode.discountPercentage}% applied successfully!`,
  });
});
