const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Section must have a title!'],
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Section must have an order!'],
      min: [1, 'Order must be at least 1!'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'A section must belong to a course!'],
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    lessonCount: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

sectionSchema.virtual('sessions', {
  ref: 'Session',
  foreignField: 'section',
  localField: '_id',
});

sectionSchema.post('find', async function (docs) {
  for (let section of docs) {
    await section.populate('sessions');
    section.totalDuration = section.sessions.reduce(
      (acc, session) => acc + session.duration,
      0
    );
    section.lessonCount = section.sessions.length;
  }
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
