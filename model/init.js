const mongoose = require('mongoose');
const config = require('../config.js');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUrl, config.mongoConfig).then(
  async () => {
    console.info('MongoDB connection successful !');
    // const Tag = require('./tag.js');
    // const tag = new Tag();
    // const kk = await tag.create(`test`);
    // console.log(`kk =`, kk);
    // const back = await tag.findById(kk._id);
    // // console.log(`back =`, back);
  },
  err => console.error('MongoDB connection fail :', err),
);

module.exports = mongoose;

