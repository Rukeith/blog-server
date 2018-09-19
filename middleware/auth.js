const _ = require('lodash');
const HTTPStatus = require('http-status');
const SessionModel = require('../model/session.js');
const { verifyToken } = require('../controller/auth.js');
const { errorResponse } = require('../controller/parse.js');

const sessionModel = new SessionModel();

module.exports = {
  /**
   * @name verifyToken
   * @desc check token is valid or expired
   */
  async verifyToken(ctx, next) {
    try {
      const token = ctx.headers['rukeith-token'];
      const session = await sessionModel.find({ token }, 'one');
      if (_.isEmpty(session)) {
        errorResponse(ctx, [HTTPStatus.UNAUTHORIZED, 'auth', 'middleware', 1000]);
        return;
      }

      const { valid = false, data = {} } = verifyToken(token);
      if (!valid) {
        await sessionModel.find(session._id, 'idu', { deletedAt: new Date() });
        errorResponse(ctx, [HTTPStatus.UNAUTHORIZED, 'auth', 'middleware', 1001, data]);
        return;
      }
      await next();
    } catch (error) { /* istanbul ignore next */
      errorResponse(ctx, [HTTPStatus.INTERNAL_SERVER_ERROR, 'auth', 'middleware', 1002, error]);
    }
  },
};
