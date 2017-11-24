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
    type: [ { type: Schema.Types.ObjectId, ref: 'Tag' } ],
    required: true,
    index: true
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  coverImages: [Schema.Types.String],
  publishedAt: Schema.Types.Date,
  deletedAt: Schema.Types.Date
});

const CategorySchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
    index: true
  },
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

module.exports = {
  Tag: mongoose.model('Tag', TagSchema),
  Article: mongoose.model('Article', ArticleSchema),
  Category: mongoose.model('Category', CategorySchema)
};