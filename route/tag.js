const _ = require('lodash');
const HTTPStatus = require('http-status');
const TagModel = require('../model/tag.js');
const { validateParameters } = require('../middleware/data.js');
const { successResponse, errorResponse } = require('../controller/parse.js');

const tagModel = new TagModel();

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
  api.post('/tags', validateParameters('post/tags'), async (ctx) => {
    let { names } = ctx.request.body;
    names = [...new Set(_.map(names, _.trim))];

    try {
      const tags = await Promise.all(_.map(names, name => ((_.isEmpty(name)) ?
        Promise.resolve() : tagModel.create(name))));

      const formatTags = _.map(tags, tag => ({ id: tag.id, name: tag.name }));
      successResponse(ctx, [HTTPStatus.CREATED, 'tag', 'api', 1000, formatTags]);
    } catch (error) {
      errorResponse(ctx, [HTTPStatus.INTERNAL_SERVER_ERROR, 'tag', 'api', 1000, error]);
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
   * @apiParam {String} [direct='desc'] sort is desc or asc
   * @apiParam {String} [sortby='createdAt'] sort data by which field
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
  api.get('/tags', validateParameters('get/tags'), async (ctx) => {
    const {
      offset = 0,
      limit = 100,
      direct = 'desc',
      sortby = 'createdAt',
    } = ctx.query;
    const options = {
      limit,
      sort: {},
      skip: offset,
    };
    if (!_.isEmpty(sortby)) options.sort[sortby] = direct || 'desc';
    if (!_.isEmpty(direct)) options.sort.createdAt = direct || 'desc';

    try {
      const tags = await tagModel.find({}, 'all', options);
      const formatTags = _.map(tags, tag => ({
        id: tag.id,
        name: tag.name,
        articles: {
          content: tag.articles,
          amount: tag.articles.length,
        },
      }));
      successResponse(ctx, [HTTPStatus.OK, 'tag', 'api', 1001, formatTags]);
    } catch (error) {
      errorResponse(ctx, [HTTPStatus.INTERNAL_SERVER_ERROR, 'tag', 'api', 1001, error]);
    }
  });

  /**
   * @api {get} /tags/:tagId?offset=0&limit=10 Get articles which are
   *  reference to the tag which id is param
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
   * @apiParam {Number} [offset=0] the article's offset
   * @apiParam {Number} [limit=10] the article's limit
   * @apiParam {String} [direct='desc'] sort is desc or asc
   * @apiParam {String} [sortby='createdAt'] sort data by which field
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
  api.get('/tags/:tagId', validateParameters('get/tags/:tagId'), async (ctx) => {
    const { tagId } = ctx.params;
    const {
      offset = 0,
      limit = 100,
      direct = 'desc',
      sortby = 'createdAt',
    } = ctx.query;

    const options = {
      limit,
      sort: {},
      skip: offset,
    };
    if (!_.isEmpty(sortby)) options.sort[sortby] = direct || 'desc';
    if (!_.isEmpty(direct)) options.sort.createdAt = direct || 'desc';

    try {
      // const options = { sort: { createdAt: 'desc' } };
      // if (!_.isNil(offset)) options.skip = offset;
      // if (!_.isNil(limit)) options.limit = limit;

      const tag = await tagModel.find({ _id: { $eq: tagId } }, 'one', {
        path: 'articles',
        // select: {
        //   url: 1,
        //   title: 1,
        //   begins: 1,
        //   createdAt: 1,
        //   coverImages: 1,
        // },
        populate: { path: 'articles' },
        // options,
      });
      if (_.isEmpty(tag)) {
        errorResponse(ctx, [HTTPStatus.BAD_REQUEST, 'tag', 'api', 1002]);
        return;
      }
      successResponse(ctx, [HTTPStatus.OK, 'tag', 'api', 1002, tag]);
    } catch (error) {
      errorResponse(ctx, [HTTPStatus.INTERNAL_SERVER_ERROR, 'tag', 'api', 1003, error]);
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
  api.patch('/tags/:tagId', validateParameters('patch/tags/:tagId'), async (ctx) => {
    const { tagId } = ctx.params;
    let { name } = ctx.request.body;
    name = _.trim(name);
    if (_.isEmpty(name)) {
      errorResponse(ctx, [HTTPStatus.BAD_REQUEST, 'tag', 'api', 1004]);
      return;
    }

    try {
      const tag = await tagModel.find(tagId, 'idu', { name });
      if (_.isEmpty(tag)) {
        errorResponse(ctx, [HTTPStatus.BAD_REQUEST, 'tag', 'api', 1002]);
        return;
      }
      successResponse(ctx, [HTTPStatus.OK, 'tag', 'api', 1003, tag]);
    } catch (error) {
      errorResponse(ctx, [HTTPStatus.BAD_REQUEST, 'tag', 'api', 1005, error]);
    }
  });

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
  api.delete('/tags/:tagId', validateParameters('delete/tags/:tagId'), async (ctx) => {
    const { tagId } = ctx.params;

    try {
      const tag = await tagModel.find(tagId, 'idu', { deletedAt: new Date() });
      if (_.isEmpty(tag)) {
        errorResponse(ctx, [HTTPStatus.BAD_REQUEST, 'tag', 'api', 1002]);
        return;
      }
      successResponse(ctx, [HTTPStatus.OK, 'tag', 'api', 1004, tag]);
    } catch (error) {
      errorResponse(ctx, [HTTPStatus.BAD_REQUEST, 'tag', 'api', 1006, error]);
    }
  });
};
