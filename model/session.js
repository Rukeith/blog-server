const _ = require('lodash');
const { Session } = require('./schema');

module.exports = class SessionModel {
  constructor() {
    this.collection = 'session';
  }

  create(options = {}) {
    if (_.isEmpty(options)) {
      throw new Error([this.collection, 'model', 1000]);
    }

    return Session.create(options);
  }

  find(queries = {}, type = 'all', options = {}) {
    if (_.isNil(queries)) {
      throw new Error([this.collection, 'model', 1001]);
    }

    let promise;
    switch (type) {
      case 'one':
        promise = Session.findOne(queries).exists('deletedAt', false);
        break;
      case 'idu':
        promise = Session.findByIdAndUpdate(queries, options, { new: true, runValidators: true });
        break;
      case 'id':
        promise = Session.findById(queries, null, options).exists('deletedAt', false);
        break;
      default:
      case 'all':
        promise = Session.find(queries, null, options).exists('deletedAt', false);
        break;
    }

    return promise;
  }
};
