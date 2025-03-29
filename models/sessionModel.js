const mongoose = require('mongoose');
const Section = require('./sectionModel'); // اگر مدل سکشن را در این فایل تعریف نکردی، ایمپورتش کن

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a session title!'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    sessionVideo: {
      type: String,
      // required: [true, 'Please provide a video URL!'],
      required: [false],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide the session duration in minutes!'],
      min: [1, 'Duration must be at least 1 minute!'],
    },
    order: {
      type: Number,
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: [true, 'A session must belong to a section!'],
    },
    free: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

sessionSchema.virtual('course', {
  ref: 'Course',
  localField: 'section',
  foreignField: '_id',
  justOne: true,
});

sessionSchema.post('save', async function () {
  const section = await Section.findById(this.section).populate('sessions');
  if (section) {
    const sessions = section.sessions || [];
    section.totalDuration = sessions.reduce(
      (acc, session) => acc + (session.duration || 0),
      0
    );
    section.lessonCount = sessions.length;
    await section.save();
  }
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
