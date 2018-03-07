# blog-server
This repository which is a nodejs api server is made for my personal blog.

[![coverage report](https://gitlab.com/Rukeith/blog-server/badges/master/coverage.svg?job=test)](https://gitlab.com/Rukeith/blog-server/badges/master/coverage.svg?job=test)

[![pipeline status](https://gitlab.com/Rukeith/blog-server/badges/master/pipeline.svg)](https://gitlab.com/Rukeith/blog-server/badges/master/pipeline.svg)

## Usage
I use koa and mongoDB to develop my blog server and support http2, track api's errors with sentry.
For code quality, I use eslint and jest with gitlab ci and jenkins to run auto testing then eploy to heroku.

## Required
* Node >= 7.10.1
* MongoDB (I use mLab to be my MongoDB)
* Sentry (Use for catch api error)

## Environment Varaiable
* `PORT` : default is 3000
* `NOED_ENV` : `yarn start` is production and `yarn dev` is development
* `MONGODB_URI` : default is localhost
* `USERNAME` : username
* `PASSWORD` : password
* `SALT` : salt for password
* `JWT_SECRET` : jwt's secret
* `SENTRY_DSN` : optional

## DevOps
* Jest
* GitLab CI
* Jenkins + Docker Compose

## Server
* Heroku

## Testing

    $ yarn
    $ yarn test

or

    $ docker-compose up --build --abort-on-container-exit


## Setup

    $ yarn
    $ yarn start
