const mongoose = require('mongoose');
const Review = require('../../models/reviewModel');
const Course = require('../../models/courseModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('./handlerFactory');

// 📌 Create a review for a specific course
exports.createReview = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const userId = req.user.id;

  // Find the course using the slug
  const course = await Course.findOne({ slug });

  if (!course) {
    return next(new AppError('Course not found!', 404));
  }

  // Check if the user has already reviewed this course
  const existingReview = await Review.findOne({
    course: course._id,
    user: userId,
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this course!', 400));
  }

  // Set user and course IDs in the request body
  req.body.user = userId;
  req.body.course = course._id;

  // Create a new review
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
});

// 📌 Get all reviews (Without making changes to the replays ⚠️)
exports.getAllReviews = factory.getAll(Review);

// 📌 Get all reviews for a specific course using slug
exports.getReviewsForCourse = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  // Find the course by slug
  const course = await Course.findOne({ slug });

  if (!course) {
    return next(new AppError('Course not found!', 404));
  }

  // Retrieve all reviews associated with the course
  const reviews = await Review.find({ course: course._id });

  if (!reviews.length) {
    return next(new AppError('No reviews found for this course!', 404));
  }

  let allReviews = [];

  // Loop through the reviews to get main reviews and replies
  reviews.forEach((review) => {
    if (!review.parentReview) {
      let replies = reviews.filter(
        (r) => String(r.parentReview) === String(review._id)
      );
      allReviews.push({
        ...review.toObject(),
        replies,
      });
    }
  });

  res.status(200).json({
    status: 'success',
    results: allReviews.length,
    data: { allReviews },
  });
});

// 📌 Get a specific review by ID
exports.getReview = factory.getOne(Review);

// 📌 Update a specific review by ID
exports.updateReview = factory.updateOne(Review);

// 📌 Delete a specific review by ID
exports.deleteReview = factory.deleteOne(Review);

// 📌 Create a reply to a review
exports.createReply = catchAsync(async (req, res, next) => {
  const { courseId, reviewId } = req.params;

  // Ensure that the reviewId is valid
  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  // Create a new reply by setting parentReview to the original review's ID
  const reply = await Review.create({
    review: req.body.review,
    course: courseId,
    user: req.user.id,
    parentReview: reviewId, // This connects the reply to the original review
  });

  res.status(201).json({
    status: 'success',
    data: { reply },
  });
});

// 📌 Get reviews and their replies
exports.getReviewsWithReplies = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({
    course: req.params.courseId,
    parentReview: null,
  })
    .populate({
      path: 'user',
      select: 'name photo',
    })
    .populate({
      path: 'replies',
      match: { parentReview: { $ne: null } },
      select: 'review rating user createdAt',
    });

  res.status(200).json({
    status: 'success',
    data: { reviews },
  });
});
