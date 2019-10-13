require('dotenv').config({
  debug: process.env.NODE_ENV !== 'production',
});
const Koa = require('Koa');
const helmet = require('koa-helmet');
const jwt = require('koa-jwt');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

// const index = require('./route/index.js');
// const article = require('./route/article.js');
// const tag = require('./route/tag.js');

// index(router);
// article(router);
// tag(router);

app
  .use(
    helmet({
      expectCt: true,
      hidePoweredBy: true,
      noCache: true,
      permittedCrossDomainPolicies: true,
      referrerPolicy: true,
    }),
  )
  .use(logger())
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(jwt({ secret: 'shared-secret' }).unless({ method: 'GET' }));

app.use(async (ctx) => {
  ctx.body = 'Hello World';
});

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.info('===========================================');
  console.info(`===== Server is running at port: ${port} =====`);
  console.info('===========================================');

  // Caught global exception error handle
  /* istanbul ignore next */
  process.on('uncaughtException', (err) => console.error('Caught exception: ', err.stack));
  /* istanbul ignore next */
  process.on('unhandledRejection', (reason, p) => console.error(
    'Unhandled Rejection at: Promise ',
    p,
    ' reason: ',
    reason.stack,
  ));
});
