const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'Enrollment must belong to a course.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Enrollment must belong to a user.'],
    },
    priceAtEnrollment: {
      type: Number,
      required: [true, 'Enrollment must have a price.'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
