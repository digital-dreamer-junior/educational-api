const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Initially, no admin is assigned
    },
    category: {
      type: String,
      enum: ['financial', 'support', 'consulting'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'answered'],
      default: 'pending',
    },
    userMessage: {
      type: String,
      required: true,
    },
    adminResponse: {
      type: String,
      default: null, // No response initially
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
