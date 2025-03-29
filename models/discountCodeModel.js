const mongoose = require('mongoose');

const discountCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    maxUsage: {
      type: Number,
      required: true,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    minPurchaseAmount: {
      type: Number,
      default: 0, // If 0, no minimum purchase amount required
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'disabled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiscountCode', discountCodeSchema);
