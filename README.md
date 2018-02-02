# blog-server
This repository which is a nodejs api server is made for my personal blog.

[![coverage report](https://gitlab.com/Rukeith/blog-server/badges/master/coverage.svg?job=test)](https://gitlab.com/Rukeith/blog-server/commits/master)

[![pipeline status](https://gitlab.com/Rukeith/blog-server/badges/master/pipeline.svg)](https://gitlab.com/Rukeith/blog-server/commits/master)

## Required
* Node >= 9.5.0
* MongoDB (I use mLab to be my MongoDB)
* Sentry (Use for catch api error)

## Environment Varaiable
* `PORT` : default is 3000
* `NOED_ENV` : `yarn start` is production and `yarn dev` is development
* `MONGODB_URI` : default is localhost
* `SENTRY_DSN` : optional

## Setup

    $ yarn
    $ yarn start
