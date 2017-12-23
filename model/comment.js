const _ = require('lodash');
const { Comment } = require('./schema');

module.exports = class CommentModel {
  constructor() {
    this.collection = 'comment';
  }

  create(options = {}) {
    if (_.isEmpty(options)) {
      throw new Error([this.collection, 'model', 1000]);
    }

    return Comment.create(options);
  }

  find(queries = {}, type = 'all', options = {}) {
    if (_.isNil(queries)) {
      throw new Error([this.collection, 'model', 1001]);
    }

    let promise;
    switch (type) {
      case 'one':
        promise = Comment.findOne(queries).exists('deletedAt', false);
        break;
      case 'idu':
        promise = Comment.findByIdAndUpdate(queries, options, { new: true, runValidators: true });
        break;
      case 'id':
        promise = Comment.findById(queries, null, options).exists('deletedAt', false);
        break;
      default:
      case 'all':
        promise = Comment.find(queries, null, options).exists('deletedAt', false);
        break;
    }

    return promise;
  }
};
