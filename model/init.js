const mongoose = require('mongoose');

/* istanbul ignore next */
const mongoUrl = (process.env.MONGODB_URI) ? process.env.MONGODB_URI : 'mongodb://127.0.0.1:27017/rukeith-blog';
mongoose.Promise = global.Promise;
mongoose.connect(mongoUrl, { useMongoClient: true }).then(
  () => console.info('MongoDB connection successful !'),
  /* istanbul ignore next */
  err => console.error('MongoDB connection fail :', err),
);

module.exports = mongoose;

