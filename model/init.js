const mongoose = require('mongoose');

const mongoUrl = (process.env.MONGODB_URI) ? process.env.MONGODB_URI : '127.0.0.1:27017';
mongoose.Promise = global.Promise;
mongoose.connect(mongoUrl, { useMongoClient: true }).then(
  () => console.info('MongoDB connection successful !'),
  err => console.error('MongoDB connection fail :', err),
);

module.exports = mongoose;

