const mongoose = require('mongoose');

const { Schema } = mongoose;
const ArticleSchema = new Schema({
  title: {
    required: true,
    type: Schema.Types.String,
  },
  begins: {
    required: true,
    type: Schema.Types.String,
  },
  content: {
    index: true,
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

const CommentSchema = new Schema({
  article_id: {
    required: true,
    ref: 'Article',
    type: Schema.Types.ObjectId,
  },
  username: {
    index: true,
    required: true,
    type: Schema.Types.String,
  },
  email: {
    type: Schema.Types.String,
  },
  context: {
    required: true,
    type: Schema.Types.String,
  },
  deletedAt: Schema.Types.Date,
}, {
  timestamps: true,
});

const SessionSchema = new Schema({
  token: {
    index: true,
    required: true,
    type: Schema.Types.String,
  },
  expiredAt: {
    required: true,
    default: Date.now,
    type: Schema.Types.Date,
  },
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
  Article: mongoose.model('Article', ArticleSchema),
  Comment: mongoose.model('Comment', CommentSchema),
  Session: mongoose.model('Session', SessionSchema),
  Tag: mongoose.model('Tag', TagSchema),
};
