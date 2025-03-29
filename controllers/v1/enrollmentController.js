const mongoose = require('mongoose');
const Enrollment = require('../../models/enrollmentModel');
const Course = require('../../models/courseModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');

// Student enrollment in a course
exports.enrollInCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new AppError('Invalid course ID format!', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found!', 404));
  }

  const existingEnrollment = await Enrollment.findOne({
    course: courseId,
    user: userId,
  });
  if (existingEnrollment) {
    return next(new AppError('You are already enrolled in this course!', 400));
  }

  const enrollment = await Enrollment.create({
    course: courseId,
    user: userId,
    priceAtEnrollment: Math.max(
      0,
      course.price - (course.price * course.discount) / 100
    ),
  });

  res.status(201).json({
    status: 'success',
    data: { enrollment },
  });
});

// Get all enrollments for a user
exports.getEnrollmentsForUser = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const enrollments = await Enrollment.find({ user: userId }).populate({
    path: 'course',
    select: 'name description price',
  });

  if (!enrollments.length) {
    return next(new AppError('No enrollments found for this user!', 404));
  }

  res.status(200).json({
    status: 'success',
    results: enrollments.length,
    data: { enrollments },
  });
});

// Get all students enrolled in a course (for admin or instructor)
exports.getEnrollmentsForCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new AppError('Invalid course ID format!', 400));
  }

  const enrollments = await Enrollment.find({ course: courseId }).populate({
    path: 'user',
    select: 'name email',
  });

  if (!enrollments.length) {
    return next(new AppError('No students enrolled in this course!', 404));
  }

  res.status(200).json({
    status: 'success',
    results: enrollments.length,
    data: { enrollments },
  });
});

// Unenroll a student from a course
exports.unenrollFromCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  const enrollment = await Enrollment.findOneAndDelete({
    course: courseId,
    user: userId,
  });

  if (!enrollment) {
    return next(new AppError('You are not enrolled in this course!', 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'You have been unenrolled from the course.',
  });
});
