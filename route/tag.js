const _ = require('lodash');
const HTTPStatus = require('http-status');
const TagModel = require('../model/tag.js');
const ArticleModel = require('../model/article.js');

const tagModel = new TagModel();
const articleModel = new ArticleModel();

module.exports = (api) => {
  api.post('/tags', async (ctx) => {
    let { name } = ctx.request.body;
    name = _.trim(name);
    if (_.isEmpty(name)) {
      ctx.status = HTTPStatus.BAD_REQUEST;
      ctx.response.body = 'Create tag parameter invaild';
      return;
    }

    try {
      const tag = await tagModel.create(name);
      ctx.status = HTTPStatus.CREATED;
      ctx.response.body = tag.toJSON();
    } catch (error) {
      ctx.status = HTTPStatus.INTERNAL_SERVER_ERROR;
      ctx.response.body = JSON.stringify(error);
    }
  });

  api.get('/tags', async (ctx) => {
    const tags = await tagModel.find();
    ctx.status = HTTPStatus.OK;
    ctx.response.body = tags;
  });

  api.get('/tags/:name', async (ctx) => {
    const name = _.trim(ctx.params.name);
    if (_.isEmpty(name)) {
      ctx.status = HTTPStatus.BAD_REQUEST;
      ctx.response.body = 'Create tag parameter invaild';
    }

    try {
      const tag = await tagModel.find({}, 'one');
      if (_.isEmpty(tag)) {
        ctx.status = HTTPStatus.BAD_REQUEST;
        ctx.response.body = 'The tag is not exists';
        return;
      }
      
    } catch (error) {
      ctx.status = HTTPStatus.INTERNAL_SERVER_ERROR;
      ctx.response.body = JSON.stringify(error);
    }
  });
};
