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

// When jest is testing
if (process.env.NODE_ENV === 'test') {
  const mongoUrl = (process.env.MONGODB_URI) ? process.env.MONGODB_URI : 'mongodb://127.0.0.1:27017/rukeith-blog';
  mongoose.Promise = global.Promise;
  mongoose.connect(mongoUrl, { useMongoClient: true }).then(
    () => console.info('MongoDB connection successful !'),
    err => console.error('MongoDB connection fail :', err),
  );
}

module.exports = {
  Tag: mongoose.model('Tag', TagSchema),
  Article: mongoose.model('Article', ArticleSchema),
};
