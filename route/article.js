const _ = require('lodash');
const HTTPStatus = require('http-status');
const TagModel = require('../model/tag.js');
const ArticleModel = require('../model/article.js');
const { validateParameters } = require('../middleware/data.js');
const { successResponse, errorResponse } = require('../controller/parse.js');

const tagModel = new TagModel();
const articleModel = new ArticleModel();

const articleSuccessResponse = (ctx, status = HTTPStatus.OK, code, data) =>
  successResponse(ctx, [status, 'article', 'api', code, data]);
const articleErrorResponse = (ctx, status = HTTPStatus.INTERNAL_SERVER_ERROR, code, error) =>
  errorResponse(ctx, [status, 'article', 'api', code, error]);

module.exports = (api) => {
  /**
   * @api {post} /articles Create article
   * @apiVersion 0.1.0
   * @apiName CreateArticle
   * @apiGroup Article
   * @apiPermission admin
   * @apiDescription Create article with tags
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
   * @apiParam {String} title article's title
   * @apiParam {String} content article's content
   * @apiParam {String} begins article's first sentence
   * @apiParam {String} [url] article's url and this should be unique
   * @apiParam {String[]} [tags] an array of tags' id which this article will reference to
   * @apiParam {String[]} [coverImages] an array of photos' url
   * @apiParamExample {params} Create-Article
   *    {
   *      "title": "JavaScript builds everything",
   *      "content": "I love it",
   *      "begins": "This is my first article's first sentence"
   *      "url": "javascript-builds-everything",
   *      "tags": [ "507f1f77bcf86cd799439011" ],
   *      "coverImages": [ "https://www.google.com" ]
   *    }
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Create-Article
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
   *      "message": "Create article processing failed"
   *    }
   */
  api.post('/articles', validateParameters('post/articles'), async (ctx) => {
    let { tags = [], coverImages = [] } = ctx.request.body;
    const {
      url,
      title,
      begins,
      content,
    } = ctx.request.body;
    tags = [...new Set(tags)];
    coverImages = [...new Set(coverImages)];
    const params = {
      title,
      begins,
      content,
      coverImages,
    };

    try {
      if (!_.isEmpty(url)) {
        const existArticle = await articleModel.find({ url }, 'one');
        if (existArticle) {
          return articleErrorResponse(ctx, HTTPStatus.BAD_REQUEST, 1000);
        }
      } else {
        params.url = new Date().getTime();
      }

      const article = await articleModel.create(params);
      if (!_.isEmpty(tags)) {
        tags = await Promise.all(_.map(tags, tagId => tagModel.find(tagId, 'id')));
        const options = { $addToSet: { articles: article.id } };
        await Promise.all(_.map(tags, tag => tagModel.find(tag.id, 'idu', options)));
      }
      articleSuccessResponse(ctx, HTTPStatus.CREATED, 1000);
    } catch (error) {
      articleErrorResponse(ctx, HTTPStatus.INTERNAL_SERVER_ERROR, 1001, error);
    }
  });

  /**
   * @api {get} /articles?offset=0&limit=10 Get articles
   * @apiVersion 0.1.0
   * @apiName GetArticles
   * @apiGroup Article
   * @apiPermission admin
   * @apiDescription Get articles which will only return id, title,
   *  first cover image, begins, createdAt and url.
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
   * @apiParam {Number} [limit=10] the limit of query amount
   * @apiParam {Number} [offset=0] start query tags at which number
   * @apiParam {String} [direct='desc'] sort is desc or asc
   * @apiParam {String} [sortby='createdAt'] sort data by which field
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Get-Articles
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
  api.get('/articles', validateParameters('get/articles'), async (ctx) => {
    const {
      offset = 0,
      limit = 10,
      direct = 'desc',
      sortby = 'createdAt',
    } = ctx.query;
    const options = {
      limit,
      sort: {},
      skip: offset,
      select: {
        url: 1,
        title: 1,
        begins: 1,
        createdAt: 1,
        coverImages: 1,
      },
    };
    if (!_.isEmpty(sortby)) options.sort[sortby] = direct || 'desc';
    if (!_.isEmpty(direct)) options.sort.createdAt = direct || 'desc';

    try {
      const articles = await articleModel.find({}, 'all', options);
      const formatArticles = _.map(articles, article => ({
        id: article.id,
        url: article.url,
        title: article.title,
        begins: article.begins,
        content: article.content,
        createdAt: article.createdAt,
      }));
      articleSuccessResponse(ctx, HTTPStatus.OK, 1001, formatArticles);
    } catch (error) {
      articleErrorResponse(ctx, HTTPStatus.INTERNAL_SERVER_ERROR, 1002, error);
    }
  });

  /**
   * @api {get} /articles/:articleId Get single article by article's id
   * @apiVersion 0.1.0
   * @apiName GetArticle
   * @apiGroup Article
   * @apiPermission admin
   * @apiDescription Get single article by article's id
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
   * @apiParam {String} articleId article's id
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Get-Article
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
   *      "message": "Get single article processing failed"
   *    }
   */
  api.get('/articles/:articleId', validateParameters('get/articles/:articleId'), async (ctx) => {
    const { articleId } = ctx.params;
    try {
      const article = await articleModel.find(articleId, 'id');
      if (_.isNil(article)) {
        return articleErrorResponse(ctx, HTTPStatus.BAD_REQUEST, 1003);
      }
      const formatArticle = {
        id: article.id,
        title: article.title,
        url: article.url,
        begins: article.begins,
        content: article.content,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      };
      articleSuccessResponse(ctx, HTTPStatus.OK, 1002, formatArticle);
    } catch (error) {
      articleErrorResponse(ctx, HTTPStatus.INTERNAL_SERVER_ERROR, 1004, error);
    }
  });

  /**
   * @api {put} /articles/:articleId Update article
   * @apiVersion 0.1.0
   * @apiName UpdateArticle
   * @apiGroup Article
   * @apiPermission admin
   * @apiDescription Update article
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
   * @apiParam {String} [title] article's title
   * @apiParam {String} [content] article's content
   * @apiParam {String[]} [coverImages] an array of photos' url
   * @apiParam {String} [url] article's url and this should be unique
   * @apiParamExample {params} Create-Tags
   *    {
   *      "title": "JavaScript builds everything",
   *      "content": "I love it",
   *      "url": "javascript-builds-everything",
   *      "coverImages": [ "https://www.google.com" ]
   *    }
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Update-Article
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
   *      "message": "Update article processing failed"
   *    }
   */
  api.put('/articles/:articleId', validateParameters('put/articles/:articleId'), async (ctx) => {
    const { articleId } = ctx.params;
    const { url, ...options } = ctx.request.body;

    try {
      if (!_.isEmpty(url)) {
        const existArticle = await articleModel.find({ url }, 'one');
        if (existArticle) {
          return articleErrorResponse(ctx, HTTPStatus.BAD_REQUEST, 1005);
        }
        options.url = url;
      }
      const article = await articleModel.find(articleId, 'id');
      if (_.isNil(article)) {
        return articleErrorResponse(ctx, HTTPStatus.BAD_REQUEST, 1006);
      }

      await articleModel.find(articleId, 'idu', options);
      articleSuccessResponse(ctx, HTTPStatus.OK, 1003);
    } catch (error) {
      articleErrorResponse(ctx, HTTPStatus.INTERNAL_SERVER_ERROR, 1007, error);
    }
  });

  /**
   * @api {put} /articles/:articleId/tags Update article's tags
   * @apiVersion 0.1.0
   * @apiName UpdateArticleTags
   * @apiGroup Article
   * @apiPermission admin
   * @apiDescription Update article's tags
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
   * @apiParam {String[]} push=[] tags which want to add to article
   * @apiParam {String[]} pull=[] tags which want to remove from article
   * @apiParamExample {params} Update-Article-Tags
   *    {
   *      "push": [ "507f1f77bcf86cd799439011" ],
   *      "pull": [ "507f1f77bcf86cd799439011" ],
   *    }
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Update-Article-Tags
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
   *      "message": "Update article processing failed"
   *    }
   */
  api.put('/articles/:articleId/tags', validateParameters('put/articles/:articleId/tags'), async (ctx) => {
    const { articleId } = ctx.params;
    const { push = [], pull = [] } = ctx.request.body;

    try {
      const article = await articleModel.find(articleId, 'id');
      if (_.isNil(article)) {
        return articleErrorResponse(ctx, HTTPStatus.BAD_REQUEST, 1008);
      }

      const promises = [];
      if (!_.isEmpty(push)) {
        _.forEach(push, (tagId) => {
          const pushPromise = new Promise(async (resolve, reject) => {
            try {
              const tag = await tagModel.find(tagId, 'id');
              if (_.isEmpty(tag)) return reject(new Error(`Tag is not existed ${tagId}`));
              await tagModel.find(tagId, 'idu', { $push: { articles: articleId } });
              resolve();
            } catch (error) {
              reject(error);
            }
          });
          promises.push(pushPromise);
        });
      }
      if (!_.isEmpty(pull)) {
        _.forEach(pull, (tagId) => {
          const pullPromise = new Promise(async (resolve, reject) => {
            try {
              const tag = await tagModel.find(tagId, 'id');
              if (_.isEmpty(tag)) return reject(new Error(`Tag is not existed ${tagId}`));
              await tagModel.find(tagId, 'idu', { $pull: { articles: articleId } });
              resolve();
            } catch (error) {
              reject(error);
            }
          });
          promises.push(pullPromise);
        });
      }
      await Promise.all(promises);
      articleSuccessResponse(ctx, HTTPStatus.OK, 1004);
    } catch (error) {
      articleErrorResponse(ctx, HTTPStatus.INTERNAL_SERVER_ERROR, 1009, error);
    }
  });

  /**
   * @api {put} /articles/:articleId/publish Publish or dispublish articles
   * @apiVersion 0.1.0
   * @apiName PublishArticle
   * @apiGroup Article
   * @apiPermission admin
   * @apiDescription Publish or dispublish articles
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
   * @apiParam {Boolean} publish true is publishe and false is unpublish
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Publish-Articles
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
   *      "message": "Publish articles processing failed"
   *    }
   */
  api.put('/articles/:articleId/publish', validateParameters('put/articles/:articleId/publish'), async (ctx) => {
    const { articleId } = ctx.params;
    const { publish } = ctx.request.body;

    try {
      const article = await articleModel.find(articleId, 'id');
      if (_.isNil(article)) {
        return articleErrorResponse(ctx, HTTPStatus.BAD_REQUEST, 1010);
      }

      const options = {};
      const publishedAt = new Date();
      if (publish) {
        options.$set = { publishedAt };
      } else {
        options.$unset = { publishedAt: 1 };
      }
      await articleModel.find(articleId, 'idu', options);
      articleSuccessResponse(ctx, HTTPStatus.OK, 1005);
    } catch (error) {
      articleErrorResponse(ctx, HTTPStatus.INTERNAL_SERVER_ERROR, 1011, error);
    }
  });

  /**
   * @api {delete} /articles/:articleId Delete article
   * @apiVersion 0.1.0
   * @apiName DeleteArticle
   * @apiGroup Article
   * @apiPermission admin
   * @apiDescription Delete article
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
   * @apiParam {String} articleId article's id
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Delete-Article
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
   *      "message": "Delete article processing failed"
   *    }
   */
  api.delete('/articles/:articleId', validateParameters('delete/articles/:articleId'), async (ctx) => {
    const { articleId } = ctx.params;

    try {
      const article = await articleModel.find(articleId, 'id');
      if (_.isNil(article)) {
        return articleErrorResponse(ctx, HTTPStatus.BAD_REQUEST, 1012);
      }
      await articleModel.find(articleId, 'idu', { deletedAt: new Date() });
      articleSuccessResponse(ctx, HTTPStatus.OK, 1006);
    } catch (error) {
      articleErrorResponse(ctx, HTTPStatus.INTERNAL_SERVER_ERROR, 1013);
    }
  });
};
