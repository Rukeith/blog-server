const mongoose = require('mongoose');
const config = require('../config.js');
const schema = require('./schema.js');
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUrl, config.mongoConfig).then(
  () => {
    console.info('MongoDB connection successful !');
    const tagSchema = schema.TagSchema;
    const Tag = mongoose.model('Tag', tagSchema);
    var t = new Tag;
    t.name = 'Statue of Liberty';
    t.save().then(c => {
      console.log('c =', c);
    });
  },
  err => console.error('MongoDB connection fail :', err)
);