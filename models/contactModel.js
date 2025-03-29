const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name!'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Please tell us your phone number!'],
      trim: true,
      validate: {
        validator: function (value) {
          return /^09\d{9}$/.test(value); // Iranian phone validation
        },
        message: 'Please provide a valid phone number',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'answered', 'closed'],
      default: 'pending',
    },
    category: {
      type: String,
      enum: ['support', 'feedback', 'technical_issue', 'general'],
      required: [true, 'Please select a category'],
    },
    message: {
      type: String,
      required: [true, 'Please enter your message text'],
      maxlength: [500, 'Message cannot exceed 500 characters'], // Limit message length
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject!'],
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
