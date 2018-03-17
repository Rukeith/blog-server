const _ = require('lodash');
const errorLevel = require('../config/error.json');
const lanUS = require('../locales/us.json');

module.exports = {
  /**
   * @func successResponse
   * @param {String} ctx - koa context
   * @param {String[]} options - success parameters
   */
  successResponse(ctx, options = []) {
    const [status, type, file, code, data] = options;
    // Translate message
    const translate = `success-${type}${_.upperFirst(file)}-${code}`;
    /* istanbul ignore next */
    const message = (process.env.NODE_ENV === 'test') ? lanUS[translate] : (ctx.i18n.__(translate) || 'Translate message not found');
    ctx.status = status;
    ctx.response.body = { status, message, data };
  },

  /**
   * @func errorResponse
   * @desc List of level
   *   debug (the least serious)
   *   info
   *   warning
   *   error
   *   fatal (the most serious)
   * @param {String} ctx - koa context
   * @param {String[]} options - error parameters
   */
  errorResponse(ctx, options = []) {
    const [status, type, file, code, error] = options;

    function translateError(ttype, tfile, tcode, isExtra = false) {
      const path = `${ttype}${_.upperFirst(tfile)}`;
      const translate = `error-${path}-${tcode}`;
      const level = errorLevel[`${path}-${tcode}`] || 'error';
      /* istanbul ignore next */
      const message = (process.env.NODE_ENV === 'test') ? lanUS[translate] : (ctx.i18n.__(translate) || 'Error code not found');
      return isExtra ? message : [ttype, path, level, message];
    }

    const [translateType, path, level = 'error', message] = translateError(type, file, code);
    let extra = '';
    if (error && error.message) {
      const errors = error.message.split(',');
      extra = (errors.length === 3) ? translateError(...errors, true) : error.message;
    } else {
      extra = _.toString(error);
    }

    ctx.sentryError = {
      level,
      extra,
      status,
      message,
      req: ctx.request,
      tags: { path, type: translateType },
      fingerprint: [process.env.NODE_ENV],
    };

    ctx.status = status;
    ctx.app.emit('error', new Error(message), ctx);
  },

  filterNull: (options = {}) => _.pickBy(options, value => !_.isNil(value)),
};
