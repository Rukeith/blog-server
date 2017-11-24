const _ = require('lodash');
const { Category } = require('./schema');

module.exports = class CategoryModel {
  create(name) {
    if (_.isEmpty(name)) {
      return Promise.reject([ 'category', 'model', 1000 ]);
    }
    return Category.findOneAndUpdate({ name }, { updatedAt: new Date() }, {
      new: true,  // If update will return new one rather than origin
      upsert: true, // If not exists then create
      setDefaultsOnInsert: true // Set default value when create
    }).exists('deletedAt', false);
  }
}
