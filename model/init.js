const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true }).then(
  () => console.info('MongoDB connection successful !'),
  err => console.error('MongoDB connection fail :', err),
);

module.exports = mongoose;

