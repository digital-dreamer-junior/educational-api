const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true],
      unique: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^09\d{9}$/.test(value);
        },
        message: 'Please provide a valid Iranian phone number',
      },
    },
  },
  { timestamps: true }
);

const BanUser = mongoose.model('BanUser', phoneSchema);

module.exports = BanUser;
