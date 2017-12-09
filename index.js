require('./model/init.js');
const Koa = require('koa');
const _ = require('lodash');
const path = require('path');
const cors = require('kcors');
const Pug = require('koa-pug');
const Raven = require('raven');
const i18n = require('koa-i18n');
const views = require('koa-views');
const koaBody = require('koa-body');
const serve = require('koa-static');
const locale = require('koa-locale');
const helmet = require('koa-helmet');
const logger = require('koa-logger');
const router = require('koa-router')();
const portfinder = require('portfinder');
const parameter = require('koa-parameter');
const enforceHttps = require('koa-sslify');

const app = new Koa();

if (process.env.SENTRY_DSN) {
  Raven.config(process.env.SENTRY_DSN, {
    sampleRate: 1,
    sendTimeout: 15,
    release: '1.0.0',
    autoBreadcrumbs: true,
    captureUnhandledRejections: true,
    environment: process.env.NODE_ENV,
  }).install();
}

locale(app);

if (process.env.NODE_ENV === 'production') {
  // Automatically redirects to an HTTPS address
  app.use(enforceHttps({ trustProtoHeader: true, trustAzureHeader: true }));
}

app
  //  It provides important security headers to make your app more secure by default.
  .use(helmet({ noCache: true, referrerPolicy: true }))
  // Enable ALL CORS Requests
  .use(cors({
    origin: '*',
    maxAge: 24 * 60 * 60,
    allowedHeaders: ['Content-Type', 'Rukeith-Token'],
    methods: ['GET', 'PUT', 'DELETE', 'POST', 'PATCH', 'OPTIONS'],
  }))
  .use(logger())
  .use(koaBody())
  .use(views(__dirname, { extension: 'pug' }))
  .use(serve(path.join(__dirname, 'public')))
  .use(router.routes())
  .use(router.allowedMethods({ throw: true }))
  .use(parameter(app))
  .use(i18n(app, {
    locales: ['us'],
    extension: '.json',
    modes: [
      'query', //  optional detect querystring - `/?locale=en-US`
      'header', //  optional detect header      - `Accept-Language: zh-CN,zh;q=0.5`
      'url', //  optional detect url         - `/en`
    ],
  }));

const pug = new Pug({
  viewPath: './views',
  debug: process.env.NODE_ENV === 'development',
});
pug.use(app);

const index = require('./route/index.js');
const tag = require('./route/tag.js');
const article = require('./route/article.js');

index(router);
tag(router);
article(router);

app.on('error', (err, ctx) => {
  try {
    if (process.env.SENTRY_DSN) {
      Raven.captureException(err, ctx.sentryError, (sentryerr, eventId) => {
        console.info(`Reported sentry error : ${eventId}`);
        if (!_.isNil(sentryerr)) console.error('Sentry capture exception error =', sentryerr);
      });
    }

    const statusCode = ctx.status || 500;
    if (statusCode === 500) {
      console.error(err.stack || err);
    }
    ctx.response.status = statusCode;

    // Default not print error message
    let error = {};
    // If env is development then print error messages for debug
    if (app.env !== 'production' && _.has(ctx, 'sentryError') && _.has(ctx.sentryError, 'extra')) {
      error = ctx.sentryError.extra;
    }
    ctx.response.body = {
      extra: error,
      status: ctx.response.status,
      level: (_.has(ctx, 'sentryError') && _.has(ctx.sentryError, 'level')) ? ctx.sentryError.level : 'error',
      message: (_.has(ctx, 'sentryError') && _.has(ctx.sentryError, 'message')) ? ctx.sentryError.message : 'unexpected error',
    };
  } catch (error) {
    console.error('Error handle fail :', error);
  }
});

portfinder.basePort = process.env.PORT ? process.env.PORT : 3000;
portfinder.getPortPromise().then((port) => {
  app.listen(port, () => {
    console.info('===========================================');
    console.info(`===== Server is running at port: ${port} =====`);
    console.info('===========================================');

    // Caught global exception error handle
    process.on('uncaughtException', err => console.error('Caught exception: ', err.stack));
    process.on('unhandledRejection', (reason, p) => console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason.stack));
  });
}).catch((error) => {
  console.error(`=======PORT ${portfinder.basePort} has been used=======`, error);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
});

module.exports = app;
