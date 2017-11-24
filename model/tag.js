const _ = require('lodash');
const { Tag } = require('./schema');

module.exports = class TagModel {
  create(name) {
    if (_.isEmpty(name)) {
      return Promise.reject([ 'tag', 'model', 1000 ]);
    }
    return Tag.findOneAndUpdate({ name }, { updatedAt: new Date() }, {
      new: true,  // If update will return new one rather than origin
      upsert: true, // If not exists then create
      setDefaultsOnInsert: true // Set default value when create
    }).exists('deletedAt', false);
  }
}
