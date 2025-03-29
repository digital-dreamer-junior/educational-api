const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
      validate: {
        validator: function (val) {
          return val.length <= 500;
        },
        message: 'Review must be less than 500 characters! ✍️',
      },
    },
    rating: {
      type: Number,
      required: function () {
        return !this.parentReview;
      },
      default: null,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      validate: {
        validator: function (val) {
          return this.parentReview || (typeof val === 'number' && !isNaN(val));
        },
        message: 'Rating must be a number! 🎯',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'Review must belong to a course.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    parentReview: {
      type: mongoose.Schema.ObjectId,
      ref: 'Review',
      default: null,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

reviewSchema.virtual('replies', {
  ref: 'Review',
  foreignField: 'parentReview',
  localField: '_id',
});

reviewSchema.index(
  { course: 1, user: 1 },
  { unique: true, partialFilterExpression: { parentReview: null } }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (courseId) {
  const stats = await this.aggregate([
    { $match: { course: courseId, parentReview: null } },
    {
      $group: {
        _id: '$course',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const Course = mongoose.model('Course');
  const course = await Course.findById(courseId);
  if (!course) return;

  if (stats.length > 0) {
    if (course.ratingsAverage !== stats[0].avgRating) {
      await Course.findByIdAndUpdate(courseId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating,
      });
    }
  } else {
    await Course.findByIdAndUpdate(courseId, {
      ratingsQuantity: 0,
      ratingsAverage: null,
    });
  }
};

reviewSchema.post('save', function () {
  if (!this.parentReview && this.rating) {
    this.constructor.calcAverageRatings(this.course);
  }
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.model.findById(this.getQuery()._id);
  if (!this.r) return next();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r && !this.r.parentReview && this.r.rating) {
    await this.r.constructor.calcAverageRatings(this.r.course);
  }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
