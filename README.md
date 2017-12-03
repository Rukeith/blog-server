# blog-server
This repository which is a nodejs api server is made for my personal blog.

## Required
* Node >= 9.2.0
* MongoDB (I use mLab to be my MongoDB)
* Sentry (Use for catch api error)

## Environment Varaiable
* `PORT` : default is 3000
* `NOED_ENV` : `yarn start` is production and `yarn dev` is development
* `MONGODB_URI` : default is localhost
* `SENTRY_DSN` : not required

## Setup

    $ yarn
    $ yarn start
