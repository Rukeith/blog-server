const mongoose = require('mongoose');
const config = require('../config.js');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUrl, config.mongoConfig).then(
  () => console.info('MongoDB connection successful !'),
  err => console.error('MongoDB connection fail :', err),
);

module.exports = mongoose;

