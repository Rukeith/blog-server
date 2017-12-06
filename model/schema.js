const mongoose = require('mongoose');

const { Schema } = mongoose;
const ArticleSchema = new Schema({
  title: {
    index: true,
    required: true,
    type: Schema.Types.String,
  },
  begins: {
    required: true,
    type: Schema.Types.String,
  },
  content: {
    required: true,
    type: Schema.Types.String,
  },
  url: {
    index: true,
    required: true,
    type: Schema.Types.String,
  },
  coverImages: [Schema.Types.String],
  publishedAt: Schema.Types.Date,
  deletedAt: Schema.Types.Date,
}, {
  timestamps: true,
});

const TagSchema = new Schema({
  name: {
    index: true,
    required: true,
    type: Schema.Types.String,
  },
  articles: {
    index: true,
    type: [
      {
        ref: 'Article',
        type: Schema.Types.ObjectId,
      },
    ],
  },
  deletedAt: Schema.Types.Date,
}, {
  timestamps: true,
});

module.exports = {
  Tag: mongoose.model('Tag', TagSchema),
  Article: mongoose.model('Article', ArticleSchema),
};
