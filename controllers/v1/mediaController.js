const catchAsync = require('../../utils/catchAsync');
const Course = require('../../models/courseModel');

exports.uploadCourseMedia = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).json({ message: 'Course not found! ❌' });
  }

  const { coverImage, promoVideo } = req.files;

  if (coverImage)
    course.coverImage = `/courses/covers/${coverImage[0].filename}`;
  if (promoVideo)
    course.promoVideo = `/courses/promo-videos/${promoVideo[0].filename}`;

  await course.save();

  res.status(200).json({
    message: 'Course media uploaded successfully! ✅',
    coverImage: course.coverImage,
    promoVideo: course.promoVideo,
  });
});
