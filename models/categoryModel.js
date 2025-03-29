const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title!'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
});

categorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
