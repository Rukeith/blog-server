const jwt = require('jsonwebtoken');
const { DateTime } = require('luxon');
const HTTPStatus = require('http-status');
const SessionModel = require('../model/session.js');
const { validateParameters } = require('../middleware/data.js');
const { verifyPassword } = require('../controller/auth');
const { successResponse, errorResponse } = require('../controller/parse.js');

const sessionModel = new SessionModel();

const indexSuccessResponse = (ctx, code, status, data) => successResponse(ctx, [status, 'index', 'api', code, data]);
const indexErrorResponse = (ctx, code, status, error) => errorResponse(ctx, [status, 'index', 'api', code, error]);

module.exports = (api) => {
  /* istanbul ignore next */
  api.get('/', ctx => ctx.render('index', { title: 'Rukeith blog backend api server' }));

  api.post('/login', validateParameters('post/login'), async (ctx) => {
    const { username, password } = ctx.request.body;
    if (username !== process.env.USERNAME) {
      indexErrorResponse(ctx, 1000, HTTPStatus.UNAUTHORIZED);
      return;
    }

    if (!verifyPassword(password)) {
      indexErrorResponse(ctx, 1001, HTTPStatus.UNAUTHORIZED);
      return;
    }

    const expiredAt = DateTime.local().plus({ minutes: 30 }).toJSDate();
    const token = jwt.sign({ ip: ctx.request.ip }, Buffer.from(process.env.JWT_SECRET), { expiresIn: '30m', issuer: process.env.ISSUER });

    try {
      await sessionModel.create({ token, expiredAt });
      indexSuccessResponse(ctx, 1000, HTTPStatus.ACCEPTED, { token });
    } catch (error) { /* istanbul ignore next */
      indexErrorResponse(ctx, 1002, HTTPStatus.INTERNAL_SERVER_ERROR);
    }
  });

  api.post('/logout', validateParameters('post/logout'), async (ctx) => {
    const { token } = ctx.request.body;
    if (!verifyPassword(token)) {
      indexErrorResponse(ctx, 1003, HTTPStatus.UNAUTHORIZED);
      return;
    }

    try {
      const session = await sessionModel.find({ token }, 'one');
      if (!verifyPassword(session)) {
        indexErrorResponse(ctx, 1003, HTTPStatus.UNAUTHORIZED);
        return;
      }

      await sessionModel.find(session._id, 'idu', { deletedAt: new Date() });
      indexSuccessResponse(ctx, 1001, HTTPStatus.ACCEPTED, { token });
    } catch (error) { /* istanbul ignore next */
      indexErrorResponse(ctx, 1004, HTTPStatus.INTERNAL_SERVER_ERROR);
    }
  });
};
