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
  verifyToken: async (ctx, next) => {
    try {
      const token = ctx.headers['rukeith-token'];
      const session = await sessionModel.find({ token }, 'one');
      if (_.isEmpty(session)) {
        errorResponse(ctx, [HTTPStatus.UNAUTHORIZED, 'auth', 'middleware', 1000]);
        return;
      }

      const { valid = false, data = {} } = verifyToken(token);
      if (!valid) {
        errorResponse(ctx, [HTTPStatus.UNAUTHORIZED, 'auth', 'middleware', 1001, data]);
        return;
      }
      await next();
    } catch (error) {
      errorResponse(ctx, [HTTPStatus.INTERNAL_SERVER_ERROR, 'auth', 'middleware', 1002, error]);
    }
  },
};
