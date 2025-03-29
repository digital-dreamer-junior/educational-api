const Course = require('../../models/courseModel');
const catchAsync = require('../../utils/catchAsync');

exports.getSearch = catchAsync(async (req, res, next) => {
  const { keyword } = req.params;

  if (!keyword) {
    return res.status(400).json({ message: 'Search keyword is required' });
  }

  const searchRegex = new RegExp(keyword, 'i');

  const courses = await Course.find({ title: searchRegex });

  res.status(200).json({ results: courses.length, courses });
});
