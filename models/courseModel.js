const mongoose = require('mongoose');
const slugify = require('slugify');
const Session = require('./sessionModel');
const Review = require('./reviewModel');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Course must have a title! 🎓'] },
    slug: { type: String, unique: true },
    description: {
      type: String,
      required: [true, 'A course needs a description! 📜'],
    },
    shortDescription: { type: String },
    coverImage: {
      type: String,
      default: 'default.jpg',
    },
    promoVideo: { type: String },
    price: { type: Number, default: 0 },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative! 🚫'],
      max: [100, 'Discount cannot be more than 100%! 🔥'],
    },
    duration: { type: Number, default: 0 },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    },
    tags: [String],
    status: {
      type: String,
      enum: ['ongoing', 'completed'],
      default: 'ongoing',
    },
    instructor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A course must have an instructor! 👨‍🏫'],
    },
    prerequisites: [{ type: mongoose.Schema.ObjectId, ref: 'Course' }],
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0!'],
      max: [5, 'Rating must be at most 5! ⭐'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from title 🔥
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

courseSchema.pre('validate', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Populate related fields automatically 📌
courseSchema.pre(/^find/, function (next) {
  this.populate('category').populate('prerequisites', 'title');
  next();
});

// Virtual populate for sections 📚
courseSchema.virtual('sections', {
  ref: 'Section',
  foreignField: 'course',
  localField: '_id',
});

// Virtual populate for reviews 📝
courseSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'course',
  localField: '_id',
});

// Compute final price after discount 💰
courseSchema.virtual('finalPrice').get(function () {
  return Math.max(0, this.price - (this.price * this.discount) / 100);
});

// When a course is deleted, remove all its reviews
courseSchema.pre('findOneAndDelete', async function (next) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    await Review.deleteMany({ course: doc._id });
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
