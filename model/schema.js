const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ArticleSchema = new Schema({
  title: {
    type: Schema.Types.String,
    required: true,
    index: true
  },
  content: {
    type: Schema.Types.String,
    required: true
  },
  url: {
    type: Schema.Types.String,
    required: true,
    index: true
  },
  tags: {
    type: [Schema.Types.String],
    required: true,
    index: true
  },
  category: {
    type: Schema.Types.String,
    required: true,
    index: true
  },
  coverImages: [Schema.Types.String],
  publishedAt: Schema.Types.Date,
  deletedAt: Schema.Types.Date
});

const TagSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
    index: true
  },
  deletedAt: Schema.Types.Date
}, {
  timestamps: true
});

const CategorySchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
    index: true
  },
  deletedAt: Schema.Types.Date
});

module.exports = {
  ArticleSchema,
  TagSchema,
  CategorySchema
};