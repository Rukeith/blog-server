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
   * @apiHeader {String} Rukeith-Token Access token
   * @apiHeaderExample {json} Token-Example
   *    {
   *      "Rukeith-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
   *        eyJpZCI6IjA4YjcyMjZjLTU1MjQtNDY3YS1iMDk0LTRkN2U1M2VjM
   *        TE0NCIsImlhdCI6MTUwNTIwNTczNSwiZXhwIjoxNTA1ODEwNTM1LCJpc3MiOiJpc3RhZ2luZyJ9.
   *        x3aQQOcF4JM30sUSWjUUpiy8BoXq7QYwnG9y8w0BgZc"
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
   * @apiSuccessExample {json} Create-Tag
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
   *      "message": "Access token is invalid"
   *    }
   *
   * @apiErrorExample {json} Server-Error
   *    HTTP/1.1 500 Internal Server Error
   *    {
   *      "status": 500,
   *      "level": "error",
   *      "message": "Create tags processing failed"
   *    }
   */
  api.post('/tags', async (ctx) => {
    let { names } = ctx.request.body;
    names = _.map(names, _.trim);

    try {
      const tags = await Promise.all(_.map(names, (name) => {
        if (!_.isEmpty(name)) {
          return new Promise(async (resolve, reject) => {
            try {
              const tag = await tagModel.create(name);
              resolve(tag.toJSON());
            } catch (error) {
              reject(error);
            }
          });
        }
        return Promise.resolve();
      }));

      ctx.status = HTTPStatus.CREATED;
      ctx.response.body = tags;
    } catch (error) {
      ctx.status = HTTPStatus.INTERNAL_SERVER_ERROR;
      ctx.response.body = JSON.stringify(error);
    }
  });

  /**
   * @api {get} /tags?offset=0&limit=100 Get tags
   * @apiVersion 0.1.0
   * @apiName GetTags
   * @apiGroup Tag
   * @apiPermission admin
   * @apiDescription Get tags list
   *
   * @apiHeader {String} Rukeith-Token Access token
   * @apiHeaderExample {json} Token-Example
   *    {
   *      "Rukeith-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
   *        eyJpZCI6IjA4YjcyMjZjLTU1MjQtNDY3YS1iMDk0LTRkN2U1M2VjM
   *        TE0NCIsImlhdCI6MTUwNTIwNTczNSwiZXhwIjoxNTA1ODEwNTM1LCJpc3MiOiJpc3RhZ2luZyJ9.
   *        x3aQQOcF4JM30sUSWjUUpiy8BoXq7QYwnG9y8w0BgZc"
   *    }
   *
   * @apiParam {Number} [limit=100] the limit of query amount
   * @apiParam {Number} [offset=0] start query tags at which number
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Get-Tags
   *    HTTP/1.1 200 OK
   *    {
   *      "status": 200,
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
   *      "message": "Access token is invalid"
   *    }
   *
   * @apiErrorExample {json} Server-Error
   *    HTTP/1.1 500 Internal Server Error
   *    {
   *      "status": 500,
   *      "level": "error",
   *      "message": "Get tags processing failed"
   *    }
   */
  api.get('/tags', async (ctx) => {
    const { offset = 0, limit = 100 } = ctx.query;

    const query = tagModel.find();
    if (!_.isEmpty(offset)) query.skip(offset);
    if (!_.isEmpty(limit)) query.limit(limit);
    
    const tags = await tagModel.find();
    ctx.status = HTTPStatus.OK;
    ctx.response.body = tags;
  });

  /**
   * @api {get} /tags/:tagId Get articles which are reference to the tag which id is param
   * @apiVersion 0.1.0
   * @apiName Get_Articles_Of_Tag
   * @apiGroup Tag
   * @apiPermission admin
   * @apiDescription Query articles by tag's id which are referenced.
   *
   * @apiHeader {String} Rukeith-Token Access token
   * @apiHeaderExample {json} Token-Example
   *    {
   *      "Rukeith-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
   *        eyJpZCI6IjA4YjcyMjZjLTU1MjQtNDY3YS1iMDk0LTRkN2U1M2VjM
   *        TE0NCIsImlhdCI6MTUwNTIwNTczNSwiZXhwIjoxNTA1ODEwNTM1LCJpc3MiOiJpc3RhZ2luZyJ9.
   *        x3aQQOcF4JM30sUSWjUUpiy8BoXq7QYwnG9y8w0BgZc"
   *    }
   *
   * @apiParam {String} tagId the tag's id
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Get-Articles-By-Tag-ID
   *    HTTP/1.1 200 OK
   *    {
   *      "status": 200,
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
   *      "message": "Access token is invalid"
   *    }
   *
   * @apiErrorExample {json} Server-Error
   *    HTTP/1.1 500 Internal Server Error
   *    {
   *      "status": 500,
   *      "level": "error",
   *      "message": "Get articles processing failed"
   *    }
   */
  api.get('/tags/:tagId', async (ctx) => {
    const tagId = _.trim(ctx.params.tagId);
    if (_.isEmpty(tagId)) {
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

  /**
   * @api {patch} /tags/:tagId Update tag's name by tagId
   * @apiVersion 0.1.0
   * @apiName Update_tag_name
   * @apiGroup Tag
   * @apiPermission admin
   * @apiDescription Update tag's name by tag's id
   *
   * @apiHeader {String} Rukeith-Token Access token
   * @apiHeaderExample {json} Token-Example
   *    {
   *      "Rukeith-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
   *        eyJpZCI6IjA4YjcyMjZjLTU1MjQtNDY3YS1iMDk0LTRkN2U1M2VjM
   *        TE0NCIsImlhdCI6MTUwNTIwNTczNSwiZXhwIjoxNTA1ODEwNTM1LCJpc3MiOiJpc3RhZ2luZyJ9.
   *        x3aQQOcF4JM30sUSWjUUpiy8BoXq7QYwnG9y8w0BgZc"
   *    }
   *
   * @apiParam {String} tagId the tag's id
   * @apiParam {String} name tha tag's new name
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Update-Tag-Name
   *    HTTP/1.1 200 OK
   *    {
   *      "status": 200,
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
   *      "message": "Access token is invalid"
   *    }
   *
   * @apiErrorExample {json} Server-Error
   *    HTTP/1.1 500 Internal Server Error
   *    {
   *      "status": 500,
   *      "level": "error",
   *      "message": "Update tag's name processing failed"
   *    }
   */
  api.patch('/tags/:tagId');

  /**
   * @api {delete} /tags/:tagId Delete tag by tagId
   * @apiVersion 0.1.0
   * @apiName DeleteTag
   * @apiGroup Tag
   * @apiPermission admin
   * @apiDescription Delete tag by tag's id
   *
   * @apiHeader {String} Rukeith-Token Access token
   * @apiHeaderExample {json} Token-Example
   *    {
   *      "Rukeith-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
   *        eyJpZCI6IjA4YjcyMjZjLTU1MjQtNDY3YS1iMDk0LTRkN2U1M2VjM
   *        TE0NCIsImlhdCI6MTUwNTIwNTczNSwiZXhwIjoxNTA1ODEwNTM1LCJpc3MiOiJpc3RhZ2luZyJ9.
   *        x3aQQOcF4JM30sUSWjUUpiy8BoXq7QYwnG9y8w0BgZc"
   *    }
   *
   * @apiParam {String} tagId the tag's id
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Delete-Tag
   *    HTTP/1.1 200 OK
   *    {
   *      "status": 200,
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
   *      "message": "Access token is invalid"
   *    }
   *
   * @apiErrorExample {json} Server-Error
   *    HTTP/1.1 500 Internal Server Error
   *    {
   *      "status": 500,
   *      "level": "error",
   *      "message": "Delete tag processing failed"
   *    }
   */
  api.delete('/tags/:tagId');
};
