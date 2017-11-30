const _ = require('lodash');
const HTTPStatus = require('http-status');
const TagModel = require('../model/tag.js');
const ArticleModel = require('../model/article.js');

const tagModel = new TagModel();
const articleModel = new ArticleModel();

module.exports = (api) => {
  /**
   * @api {post} /tags Create tags
   * @apiVersion 0.1.0
   * @apiName CreateTags
   * @apiGroup Tag
   * @apiPermission admin
   * @apiDescription Create multiple tags, if tag already existed then query it.
   *
   * @apiHeader {String} Rukeith-Token Acess token
   * @apiHeaderExample {json} Token-Example
   *    {
   *      "Rukeith-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA4YjcyMjZjLTU1MjQtNDY3YS1iMDk0LTRkN2U1M2VjMTE0NCIsImlhdCI6MTUwNTIwNTczNSwiZXhwIjoxNTA1ODEwNTM1LCJpc3MiOiJpc3RhZ2luZyJ9.x3aQQOcF4JM30sUSWjUUpiy8BoXq7QYwnG9y8w0BgZc"
   *    }
   * 
   * @apiParam {String[]} names An array of tags' name
   * @apiParamExample {params} Create-Tags
   *    {
   *      "names": [ "tag1", "tag2" ]
   *    }
   * 
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Create-Room
   *    HTTP/1.1 201 Created
   *    {
   *      "status": 201,
   *      "message": "success"
   *    }
   * 
   * @apiError {String} level error level
   * @apiError {String} message error message
   * @apiError {Number} status HTTP Status code
   * @apiErrorExample {json} Token-Error
   *    HTTP/1.1 401 Unauthorized
   *    {
   *      "status": 401,
   *      "level": "warning",
   *      "message": "Session token is invalid"
   *    }
   * 
   * @apiErrorExample {json} Server-Error
   *    HTTP/1.1 500 Internal Server Error
   *    {
   *      "status": 500,
   *      "level": "error",
   *      "message": "Create room process fail"
   *    }
   */
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

  /**
   * @api {get} /tags Get tags
   * @apiVersion 0.1.0
   * @apiName GetTags
   * @apiGroup Tag
   * @apiPermission admin
   * @apiDescription Get tags list
   *
   * @apiHeader {String} Rukeith-Token Acess token
   * @apiHeaderExample {json} Token-Example
   *    {
   *      "Rukeith-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA4YjcyMjZjLTU1MjQtNDY3YS1iMDk0LTRkN2U1M2VjMTE0NCIsImlhdCI6MTUwNTIwNTczNSwiZXhwIjoxNTA1ODEwNTM1LCJpc3MiOiJpc3RhZ2luZyJ9.x3aQQOcF4JM30sUSWjUUpiy8BoXq7QYwnG9y8w0BgZc"
   *    }
   *
   * @apiParam {String} q An array of tags' name
   * @apiParamExample {params} Create-Tags
   *    {
   *      "names": [ "tag1", "tag2" ]
   *    }
   * 
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Create-Room
   *    HTTP/1.1 201 Created
   *    {
   *      "status": 201,
   *      "message": "success"
   *    }
   * 
   * @apiError {String} level error level
   * @apiError {String} message error message
   * @apiError {Number} status HTTP Status code
   * @apiErrorExample {json} Token-Error
   *    HTTP/1.1 401 Unauthorized
   *    {
   *      "status": 401,
   *      "level": "warning",
   *      "message": "Session token is invalid"
   *    }
   * 
   * @apiErrorExample {json} Server-Error
   *    HTTP/1.1 500 Internal Server Error
   *    {
   *      "status": 500,
   *      "level": "error",
   *      "message": "Create room process fail"
   *    }
   */
  api.get('/tags', async (ctx) => {
    const tags = await tagModel.find();
    ctx.status = HTTPStatus.OK;
    ctx.response.body = tags;
  });

  /**
   * @api {post} /tags Create tags
   * @apiVersion 0.1.0
   * @apiName CreateTags
   * @apiGroup Tag
   * @apiPermission admin
   * @apiDescription Create multiple tags, if tag already existed then query it.
   *
   * @apiHeader {String} Rukeith-Token Acess token
   * @apiHeaderExample {json} Token-Example
   *    {
   *      "Rukeith-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA4YjcyMjZjLTU1MjQtNDY3YS1iMDk0LTRkN2U1M2VjMTE0NCIsImlhdCI6MTUwNTIwNTczNSwiZXhwIjoxNTA1ODEwNTM1LCJpc3MiOiJpc3RhZ2luZyJ9.x3aQQOcF4JM30sUSWjUUpiy8BoXq7QYwnG9y8w0BgZc"
   *    }
   * 
   * @apiParam {String[]} names An array of tags' name
   * @apiParamExample {params} Create-Tags
   *    {
   *      "names": [ "tag1", "tag2" ]
   *    }
   * 
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Create-Room
   *    HTTP/1.1 201 Created
   *    {
   *      "status": 201,
   *      "message": "success"
   *    }
   * 
   * @apiError {String} level error level
   * @apiError {String} message error message
   * @apiError {Number} status HTTP Status code
   * @apiErrorExample {json} Token-Error
   *    HTTP/1.1 401 Unauthorized
   *    {
   *      "status": 401,
   *      "level": "warning",
   *      "message": "Session token is invalid"
   *    }
   * 
   * @apiErrorExample {json} Server-Error
   *    HTTP/1.1 500 Internal Server Error
   *    {
   *      "status": 500,
   *      "level": "error",
   *      "message": "Create room process fail"
   *    }
   */
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
