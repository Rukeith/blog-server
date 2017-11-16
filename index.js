'use strict';
const Koa = require('koa');
const _ = require('lodash');
const path = require('path');
const cors = require('kcors');
const Pug = require('koa-pug');
const Raven = require('raven');
const views = require('koa-views');
const koaBody = require('koa-body');
const serve = require('koa-static');
const helmet = require('koa-helmet');
const logger = require('koa-logger');
const router = require('koa-router')();
const parameter = require('koa-parameter');
const enforceHttps = require('koa-sslify');
const config = require('./config.js');
const app = new Koa();

Raven.config(config.sentryKey, {
  release: '1.0.0',
  environment: process.env.NODE_ENV,
  sampleRate: 1,
  sendTimeout: 15,
  autoBreadcrumbs: true,
  captureUnhandledRejections: true
}).install();

if (process.env.NODE_ENV === 'production') {
  app.use(enforceHttps({ trustProtoHeader: true, trustAzureHeader: true }));  // Automatically redirects to an HTTPS address
}

app
  //  It provides important security headers to make your app more secure by default.
  .use(helmet({ noCache: true, referrerPolicy: true }))
  // Enable ALL CORS Requests
  .use(cors({
    origin: '*',
    maxAge: 24 * 60 * 60,
    methods: [ 'GET', 'PUT', 'DELETE', 'POST', 'PATCH', 'OPTIONS' ],
    allowedHeaders: [ 'Content-Type', 'Rukeith-Token' ]
  }))
  .use(logger())
  .use(koaBody())
  .use(views(__dirname, { extension: 'pug' }))
  .use(serve(path.join(__dirname, 'public')))
  .use(router.routes())
  .use(router.allowedMethods({ throw: true }))
  .use(parameter(app));

const pug = new Pug({
  viewPath: './views',
  debug: process.env.NODE_ENV === 'development'
});
pug.use(app);

require('./model/init.js');
const index = require('./route/index.js');
// const auth = require('./route/auth.js');
index(router);
// auth(router);

app.on('error', (err, ctx) => {
  try {
    Raven.captureException(err, ctx.sentryError, (sentryerr, eventId) => {
      console.info(`Reported sentry error : ${eventId}`);
      if (!_.isNil(sentryerr)) console.error('Sentry capture exception error =', sentryerr);
    });

    const statusCode = ctx.status || 500;
    if (statusCode === 500) {
      console.error(err.stack || err);
    }
    ctx.response.status = statusCode;

    // 預設不輸出異常詳情
    let error = {};
    // 如果是開發環境，則將異常堆棧輸出到頁面，方便開發調試
    if (app.env !== 'production' && _.has(ctx, 'sentryError') && _.has(ctx.sentryError, 'extra')) {
      error = ctx.sentryError.extra;
    }
    ctx.response.body = {
      extra: error,
      status: ctx.response.status,
      level: (_.has(ctx, 'sentryError') && _.has(ctx.sentryError, 'level')) ? ctx.sentryError.level : 'error',
      message: (_.has(ctx, 'sentryError') && _.has(ctx.sentryError, 'message')) ? ctx.sentryError.message : 'unexpected error'
    };
  } catch (error) {
    console.error('Error handle fail :', error);
  }
});

const PORT = config ? config.port : 3000;
app.listen(PORT, () => {
  console.info('===========================================');
  console.info(`===== Server is running at port: ${PORT} =====`);
  console.info('===========================================');

  // 註冊全域未捕獲異常的處理器
  process.on('uncaughtException', (err) => {
    console.error('Caught exception: ', err.stack);
  });
  process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason.stack);
  });
});

module.exports = app;