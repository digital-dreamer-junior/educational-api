const mongoose = require('mongoose');
const validator = require('validator');

const newsLetterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
  },
  {
    timestamps: true,
  }
);

const NewsLetter = mongoose.model('NewsLetter', newsLetterSchema);

module.exports = NewsLetter;
