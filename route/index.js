const jwt = require('jsonwebtoken');
const { DateTime } = require('luxon');
const HTTPStatus = require('http-status');
const SessionModel = require('../model/session.js');
const { validateParameters } = require('../middleware/data.js');
const { successResponse, errorResponse } = require('../controller/parse.js');

const sessionModel = new SessionModel();

const indexSuccessResponse = (ctx, code, status, data) => successResponse(ctx, [status, 'index', 'api', code, data]);
const indexErrorResponse = (ctx, code, status, error) => errorResponse(ctx, [status, 'index', 'api', code, error]);

module.exports = (api) => {
  /* istanbul ignore next */
  api.get('/', ctx => ctx.render('index', { title: 'Rukeith blog backend api server' }));

  api.post('/login', validateParameters('post/login'), async (ctx) => {
    const { username, password } = ctx.request.body;
    if (username !== process.env.USERNAME || password !== process.env.PASSWORD) {
      indexErrorResponse(ctx, 1000, HTTPStatus.UNAUTHORIZED);
      return;
    }
    const expiredAt = DateTime.local().plus({ minutes: 30 }).toJSDate();
    const token = jwt.sign({ ip: ctx.request.ip }, Buffer.from(process.env.JWT_SECRET), { expiresIn: '30m', issuer: 'rukeith' });

    try {
      await sessionModel.create({ token, expiredAt });
      indexSuccessResponse(ctx, 1000, HTTPStatus.ACCEPTED, { token });
    } catch (error) { /* istanbul ignore next */
      indexErrorResponse(ctx, 1001, HTTPStatus.INTERNAL_SERVER_ERROR);
    }
  });
};
