const mongoose = require('mongoose');
const Course = require('../../models/courseModel');
const Section = require('../../models/sectionModel');
const Review = require('../../models/reviewModel');
const Enrollment = require('../../models/enrollmentModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('./handlerFactory');
const Category = require('../../models/categoryModel');

// 📌 Get all courses
exports.getAllCourses = factory.getAll(Course);

// // 📌 Get a specific course by ID (with sections)
// exports.getCourse = factory.getOne(Course, { path: 'sections' });
///////////////////////
exports.getCourse = catchAsync(async (req, res, next) => {
  const { slug } = req.params;

  const course = await Course.findOne({ slug })
    .populate('sections')
    .populate('instructor', 'name');

  if (!course) {
    return next(new AppError('Course not found!', 404));
  }

  const enrollmentCount = await Enrollment.countDocuments({
    course: course._id,
  });

  const reviews = await Review.find({ course: course._id })
    .populate('user')
    .lean();

  const isUserEnrolled = req.user
    ? !!(await Enrollment.findOne({ user: req.user._id, course: course._id }))
    : false;

  let allReviews = [];

  reviews.forEach((review) => {
    if (!review.parentReview) {
      let replies = reviews.filter(
        (r) => String(r.parentReview) === String(review._id)
      );
      allReviews.push({
        ...review,
        replies,
      });
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      course,
      enrollmentCount,
      reviews: allReviews,
      isUserEnrolled,
    },
  });
});

//////////////////////////
// 📌 Create a new course (Instructor is set from req.user.id)
exports.createCourse = catchAsync(async (req, res, next) => {
  if (!req.user?.id) {
    return next(new AppError('Unauthorized! User not found.', 401));
  }

  // Dynamically retrieve required fields from the model
  const requiredFields = Object.keys(Course.schema.paths).filter(
    (field) => Course.schema.paths[field].isRequired
  );

  // Assign the instructor ID from the authenticated user
  req.body.instructor = req.user.id;

  // Check for missing required fields
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return next(
      new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400)
    );
  }

  const newCourse = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { course: newCourse },
  });
});

// 📌 Update an existing course
exports.updateCourse = factory.updateOne(Course);

// 📌 Delete a course
exports.deleteCourse = factory.deleteOne(Course);

exports.getCoursesByCategory = catchAsync(async (req, res, next) => {
  const { href } = req.params;
  const category = await Category.findOne({ slug: href });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const categoryCourses = await Course.find({ category: category._id });

  res.status(200).json({
    status: 'success',
    results: categoryCourses.length,
    data: categoryCourses,
  });
});

exports.getRelatedCourses = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const course = await Course.findOne({ slug });

  if (!course) {
    return next(new AppError('course not found', 404));
  }

  let relatedCourses = await Course.find({ category: course.category });

  relatedCourses = relatedCourses.filter((course) => course.slug !== slug);

  res.status(200).json({
    status: 'success',
    data: relatedCourses,
  });
});

// 📌 Get all sections of a specific course with session count and total duration
exports.getCourseSections = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new AppError('Invalid course ID format!', 400));
  }

  const sections = await Section.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $lookup: {
        from: 'sessions',
        localField: '_id',
        foreignField: 'section',
        as: 'sessions',
      },
    },
    {
      $addFields: {
        totalSessions: { $size: '$sessions' },
        totalDuration: { $sum: '$sessions.duration' },
      },
    },
    { $sort: { order: 1 } },
  ]);

  if (!sections.length) {
    return next(new AppError('No sections found for this course!', 404));
  }

  res.status(200).json({
    status: 'success',
    results: sections.length,
    data: { sections },
  });
});

// 📌 Get a course along with its sections and sessions
exports.getCourseWithSections = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return next(new AppError('Invalid course ID format!', 400));
  }

  const course = await Course.findById(courseId).populate({
    path: 'sections',
    populate: { path: 'sessions' },
  });

  if (!course) {
    return next(new AppError('Course not found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { course },
  });
});

// ---- SECTIONS ----

exports.getCourseSections = (req, res, next) => {
  req.query.course = req.params.courseId;
  next();
};

exports.getSection = factory.getOne(Section, 'sessions');

exports.createSection = (req, res, next) => {
  if (!req.body.course) req.body.course = req.params.courseId;
  factory.createOne(Section)(req, res, next);
};

exports.updateSection = factory.updateOne(Section);

exports.deleteSection = factory.deleteOne(Section);
