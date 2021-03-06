require('dotenv').config();
require('./model/init.js');
const fs = require('fs');
const Koa = require('koa');
const _ = require('lodash');
const path = require('path');
const cors = require('kcors');
const http2 = require('http2');
const redis = require('redis');
const Raven = require('raven');
const Pug = require('koa-pug');
const i18n = require('koa-i18n');
const winston = require('winston');
const Rollbar = require('rollbar');
const views = require('koa-views');
const serve = require('koa-static');
const koaBody = require('koa-body');
const mongoose = require('mongoose');
const locale = require('koa-locale');
const helmet = require('koa-helmet');
const logger = require('koa-logger');
const Router = require('koa-router');
const portfinder = require('portfinder');
const HTTPStatus = require('http-status');
const parameter = require('koa-parameter');
const ratelimit = require('koa-ratelimit');
const enforceHttps = require('koa-sslify');
const elasticsearch = require('elasticsearch');
const { errorResponse } = require('./controller/parse.js');

const app = new Koa();
const router = new Router();
router.use((ctx, next) => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  /* istanbul ignore if */
  if (mongoose.connection.readyState !== 1 && process.env.NODE_ENV !== 'test') {
    return errorResponse(ctx, [HTTPStatus.INTERNAL_SERVER_ERROR, 'index', '', 1000]);
  }
  return next();
});

/* Setup log */
const logInfo = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple(),
  ),
});
const log = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.prettyPrint(),
  ),
});

/* Init rollbar */
let rollbar;
/* istanbul ignore if */
if (process.env.ROLLBAR_ACCESS_TOKEN) {
  rollbar = new Rollbar(process.env.ROLLBAR_ACCESS_TOKEN);
}
/* Init sentry */
/* istanbul ignore if */
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
/* Init Bonsai Elasticsearch */
/* istanbul ignore if */
if (process.env.BONSAI_URL) {
  const client = new elasticsearch.Client({
    host: process.env.BONSAI_URL,
    log: 'trace',
  });

  // Test the connection:
  // Send a HEAD request to "/" and allow
  // up to 30 seconds for it to complete.
  client.ping({ requestTimeout: 30000 }, (error) => {
    if (error) {
      log.error('Elasticsearch cluster is down!');
    } else {
      logInfo.info('Elasticsearch is well');
    }
  });
}

locale(app);

/* istanbul ignore if */
if (process.env.NODE_ENV === 'production') {
  // Automatically redirects to an HTTPS address
  app.use(enforceHttps({ trustProtoHeader: true, trustAzureHeader: true }));
}

/* Init rate limit */
const client = redis.createClient(process.env.REDIS_URL || 'redis://localhost:6379');
client.on('connect', () => {
  logInfo.info('=== Redis connected ===');
  app.use(ratelimit({
    db: client,
    duration: 60000,
    errorMessage: 'API reach limit, you need to wait for a min',
    id(ctx) { return ctx.ip; },
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total',
    },
    max: 100,
    disableHeader: false,
  }));
});

/* istanbul ignore next */
client.on('error', err => log.error('Redis connecting failed !!!', err));

const index = require('./route/index.js');
const article = require('./route/article.js');
const comment = require('./route/comment.js');
const tag = require('./route/tag.js');

index(router);
article(router);
comment(router);
tag(router);

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
  .use(router.routes({ allowedMethods: 'throw' }))
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

app.on('error', (err, ctx) => {
  /* istanbul ignore if */
  if (rollbar) rollbar.log(err);

  try {
    /* istanbul ignore if */
    if (process.env.SENTRY_DSN) {
      Raven.captureException(err, ctx.sentryError, (sentryerr, eventId) => {
        log.error(`Reported sentry error : ${eventId}`);
        if (!_.isNil(sentryerr)) log.error('Sentry capture exception error =', sentryerr);
      });
    }

    const statusCode = ctx.status || 500;
    if (statusCode === 500) {
      log.error(err.stack || err);
    }
    ctx.response.status = statusCode;

    // Default not print error message
    let error = {};
    // If env is development then print error messages for debug
    /* istanbul ignore else */
    if (app.env !== 'production' && _.has(ctx, 'sentryError') && _.has(ctx.sentryError, 'extra')) {
      error = ctx.sentryError.extra;
    }
    ctx.response.body = {
      extra: error,
      status: ctx.response.status,
      level: (_.has(ctx, 'sentryError') && _.has(ctx.sentryError, 'level')) ? ctx.sentryError.level : 'error',
      message: (_.has(ctx, 'sentryError') && _.has(ctx.sentryError, 'message')) ? ctx.sentryError.message : 'unexpected error',
    };
  } catch (error) { /* istanbul ignore next */
    log.error('Error handle fail :', error);
  }
});

/* istanbul ignore if */
if (process.env.NODE_ENV === 'production') {
  http2.createSecureServer(
    {
      allowHTTP1: true,
      key: fs.readFileSync('./ssl.key', 'utf8'),
      cert: fs.readFileSync('./ssl.cert', 'utf8'),
    },
    app.callback(),
  ).listen(443);
} else {
  portfinder.basePort = process.env.PORT ? process.env.PORT : 5000;
  portfinder.getPortPromise().then((port) => {
    app.listen(port, () => {
      logInfo.info('===========================================');
      logInfo.info(`===== Server is running at port: ${port} =====`);
      logInfo.info('===========================================');

      // Caught global exception error handle
      /* istanbul ignore next */
      process.on('uncaughtException', err => log.error('Caught exception: ', err.stack));
      /* istanbul ignore next */
      process.on('unhandledRejection', (reason, p) => log.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason.stack));
    });
  /* istanbul ignore next */
  }).catch((error) => { /* istanbul ignore next */
    log.error(`=======PORT ${portfinder.basePort} has been used=======`, error);
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  });
}

module.exports = app;
