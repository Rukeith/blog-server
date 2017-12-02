const _ = require('lodash');
const { Article } = require('./schema');

module.exports = class ArticleModel {
  constructor() {
    this.collection = 'article';
  }

  create(options = {}) {
    if (_.isEmpty(options)) {
      throw new Error([this.collection, 'model', 1000]);
    }
    return Article.create(options);
  }

  find(queries = {}, type = 'all', options = {}) {
    if (_.isNil(queries)) {
      throw new Error([this.collection, 'model', 1001]);
    }

    let promise;
    switch (type) {
      case 'one':
        promise = Article.findOne(queries).exists('deletedAt', false);
        break;
      case 'idu':
        promise = Article.findByIdAndUpdate(queries, options, { new: true, runValidators: true });
        break;
      case 'all':
        promise = Article.find(queries, null, options).exists('deletedAt', false);
        break;
      default:
      case 'id':
        promise = Article.findById(queries, null, options).exists('deletedAt', false);
        break;
    }

    return promise;
  }
};
