const Category = require('../../models/categoryModel');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const factory = require('./handlerFactory');
const slugify = require('slugify');

exports.updateCategory = catchAsync(async (req, res, next) => {
  if (req.body.title) {
    req.body.slug = slugify(req.body.title, { lower: true, strict: true });
  }

  factory.updateOne(Category)(req, res, next);
});

exports.getAllCategorys = factory.getAll(Category);
exports.creatCategory = factory.createOne(Category);

exports.getCategory = factory.getOne(Category);
// exports.updateCategory = factory.updateOne(Category);
exports.deleteCategory = factory.deleteOne(Category);
