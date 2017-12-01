const _ = require('lodash');
const { Tag } = require('./schema');

module.exports = class TagModel {
  constructor() {
    this.collection = 'tag';
  }

  create(name) {
    if (_.isEmpty(name)) {
      return Promise.reject(new Error([this.collection, 'model', 1000]));
    }

    return Tag.findOneAndUpdate({ name }, { updatedAt: new Date() }, {
      new: true, // If update will return new one rather than origin
      upsert: true, // If not exists then create
      setDefaultsOnInsert: true, // Set default value when create
    }).exists('deletedAt', false);
  }

  find(queries = {}, type = 'all', options = {}) {
    if (_.isNil(queries)) {
      return Promise.reject(new Error([this.collection, 'model', 1001]));
    }

    let promise;
    switch (type) {
      case 'one':
        promise = Tag.findOne(queries).exists('deletedAt', false);
        break;
      case 'idu':
        promise = Tag.findByIdAndUpdate(queries, options, { new: true, runValidators: true });
        break;
      default:
      case 'all':
        promise = Tag.find(queries, null, options).exists('deletedAt', false);
        break;
    }

    return promise;
  }
};
