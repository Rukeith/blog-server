const winston = require('winston');
const mongoose = require('mongoose');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.prettyPrint(),
  ),
});

/* istanbul ignore next */
const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rukeith-blog';
mongoose.Promise = global.Promise;
mongoose.connect(mongoUrl, { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false }).then(
  () => logger.info('=== MongoDB connection successful ==='),
  /* istanbul ignore next */
  error => logger.error('MongoDB connection fail :', error),
);

module.exports = mongoose;
