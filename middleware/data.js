const _ = require('lodash');
const HTTPStatus = require('http-status');
const parameterConfig = require('../config/parameter.json');
const { errorResponse } = require('../controller/parse.js');

module.exports = {
  /**
   * @name validateParameters
   * @desc check parameters at request body is correct or not
   * @param {string} path the path which middleware will check
   */
  validateParameters: path => async (ctx, next) => {
    try {
      if (!_.has(parameterConfig, path)) {
        errorResponse(ctx, [HTTPStatus.BAD_REQUEST, 'data', 'middleware', 1000]);
        return;
      }
      ctx.verifyParams(parameterConfig[path]);
      await next();
    } catch (error) {
      const err = (error.code === 'INVALID_PARAM') ? JSON.stringify(error.errors) : error;
      errorResponse(ctx, [HTTPStatus.INTERNAL_SERVER_ERROR, 'data', 'middleware', 1001, err]);
    }
  },
};
