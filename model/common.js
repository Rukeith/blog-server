const _ = require('lodash');
const model = require('./schema');

module.exports = class CommonModel {
  constructor(table) {
    if (_.isEmpty(table)) {
      throw new Error(['common', 'model', 1000]);
    }
    const tableLower = table.toLowerCase();
    this.collection = tableLower;
    this.model = model[_.upperFirst(tableLower)];
  }

  create(options = {}) {
    if (_.isEmpty(options)) {
      throw new Error([this.collection, 'model', 1000]);
    }

    return this.model.create(options);
  }

  find(queries = {}, type = 'all', options = {}, fields = null) {
    if (_.isNil(queries)) {
      throw new Error([this.collection, 'model', 1001]);
    }

    let promise;
    switch (type) {
      case 'one':
        promise = this.model.findOne(queries, fields, options).exists('deletedAt', false).lean();
        break;
      case 'idu':
        promise = this.model.findByIdAndUpdate(queries, options, { select: fields, new: true, runValidators: true }).lean();
        break;
      case 'id':
        promise = this.model.findById(queries, fields, options).exists('deletedAt', false).lean();
        break;
      case 'all':
      default:
        promise = this.model.find(queries, fields, options).exists('deletedAt', false).lean();
        break;
    }

    return promise;
  }
};
