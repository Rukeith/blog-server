const _ = require('lodash');
const HTTPStatus = require('http-status');
const TagModel = require('../model/tag.js');
const ArticleModel = require('../model/article.js');
const CommentModel = require('../model/comment.js');
const { verifyToken } = require('../middleware/auth.js');
const { validateParameters } = require('../middleware/data.js');
const { successResponse, errorResponse } = require('../controller/parse.js');

const tagModel = new TagModel();
const commentModel = new CommentModel();
const articleModel = new ArticleModel();

const articleSuccessResponse = (ctx, code, status = HTTPStatus.OK, data) => successResponse(ctx, [status, 'article', 'api', code, data]);
const articleErrorResponse = (ctx, code, status = HTTPStatus.BAD_REQUEST, error) => errorResponse(ctx, [status, 'article', 'api', code, error]);
const commentSuccessResponse = (ctx, code, status = HTTPStatus.CREATED, data) => successResponse(ctx, [status, 'comment', 'api', code, data]);
const commentErrorResponse = (ctx, code, status, error) => errorResponse(ctx, [status, 'comment', 'api', code, error]);

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
   * @apiParam {String} category article's category
   * @apiParam {String} [url] article's url and this should be unique
   * @apiParam {String[]} [tags] an array of tags' id which this article will reference to
   * @apiParam {String[]} [coverImages] an array of photos' url
   * @apiParamExample {params} Create-Article
   *    {
   *      "title": "JavaScript builds everything",
   *      "content": "I love it",
   *      "begins": "This is my first article's first sentence",
   *      "category": [ "javascript", "nodejs" ],
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
  api.post('/articles', verifyToken, validateParameters('post/articles'), async (ctx) => {
    let { tags = [], category = [], coverImages = [] } = ctx.request.body;
    const {
      url,
      title,
      begins,
      content,
    } = ctx.request.body;

    // Check values did not duplicate
    tags = _.dropWhile([...new Set(_.map(tags, _.trim))], _.isEmpty);
    category = _.dropWhile([...new Set(_.map(category, _.trim))], _.isEmpty);
    coverImages = _.dropWhile([...new Set(_.map(coverImages, _.trim))], _.isEmpty);

    const params = {
      title,
      begins,
      content,
      category: category.join('>'),
      coverImages,
    };

    try {
      // Check url is unique
      if (!_.isEmpty(url)) {
        const existArticle = await articleModel.find({ url }, 'one');
        if (existArticle) {
          articleErrorResponse(ctx, 1000);
          return;
        }
      }

      // If url is empty get a default value then create article
      params.url = url || new Date().getTime();
      const article = await articleModel.create(params);

      // Join tags with article
      if (!_.isEmpty(tags)) {
        tags = await Promise.all(_.map(tags, tagId => tagModel.find(tagId, 'id')));
        tags = _.dropWhile(tags, _.isEmpty);
        const options = { $addToSet: { articles: article._id } };
        await Promise.all(_.map(tags, tag => tagModel.find(tag._id, 'idu', options)));
      }
      articleSuccessResponse(ctx, 1000, HTTPStatus.CREATED);
    } catch (error) {
      articleErrorResponse(ctx, 1001, HTTPStatus.INTERNAL_SERVER_ERROR, error);
    }
  });

  /**
   * @api {post} /articles/:articleId/comments Create article's comment
   * @apiVersion 0.1.0
   * @apiName CreateComment
   * @apiGroup Comment
   * @apiPermission anyone
   * @apiDescription Create article's comment
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
   * @apiParam {String} username comment's content
   * @apiParam {String} [email] comment's email
   * @apiParam {String} context comment context
   * @apiParamExample {params} Create-Comment
   *    {
   *      "username": "guest",
   *      "email": "test@test.test",
   *      "context": "Jest test"
   *    }
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Create-Comment
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
  api.post('/articles/:articleId/comments', validateParameters('post/articles/:articleId/comments'), async (ctx) => {
    const { articleId } = ctx.params;
    const { username, email, context } = ctx.request.body;

    try {
      const article = await articleModel.find(articleId, 'id');
      if (_.isNil(article)) {
        articleErrorResponse(ctx, 1003);
        return;
      }

      await commentModel.create({
        email,
        context,
        username,
        article_id: article._id,
      });
      commentSuccessResponse(ctx, 1000);
    } catch (error) {
      commentErrorResponse(ctx, 1000, HTTPStatus.INTERNAL_SERVER_ERROR, error);
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
   * @apiParam {Number} [fields=title,begins] specific data's fields
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
    let {
      offset = 0,
      limit = 10,
      direct = 'desc',
    } = ctx.query;
    const { sortby = 'createdAt', fields = '' } = ctx.query;

    if (!_.isInteger(offset)) offset = _.toInteger(offset);
    if (offset < 0) offset = 0;
    if (!_.isInteger(limit)) limit = _.toInteger(limit);
    if (limit > 10 || limit < 0) limit = 10;
    if (direct !== 'desc' && direct !== 'asc') direct = 'desc';

    const sort = {};
    sort[sortby] = direct;

    const options = {
      sort,
      limit,
      select: {},
      skip: offset,
    };

    if (!_.isEmpty(fields)) {
      fields.split(',').forEach((value) => {
        options.select[value] = 1;
      });
    }

    try {
      const articles = await articleModel.find({}, 'all', options);
      articleSuccessResponse(ctx, 1001, HTTPStatus.OK, articles);
    } catch (error) { /* istanbul ignore next */
      articleErrorResponse(ctx, 1002, HTTPStatus.INTERNAL_SERVER_ERROR, error);
    }
  });

  /**
   * @api {get} /articles/:filterValue Get single article by article's id or url
   * @apiVersion 0.1.0
   * @apiName GetArticle
   * @apiGroup Article
   * @apiPermission admin
   * @apiDescription Get single article by article's id or url
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
   * @apiParam {String} filterValue article's url
   * @apiParam {String} [filterType] values are url, id default is url
   * @apiParam {Number} [fields=title,begins] specific data's fields
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
  api.get('/articles/:filterValue', validateParameters('get/articles/:filterValue'), async (ctx) => {
    let select;
    const { fields = '', filterKey = 'url' } = ctx.query;
    const { filterValue } = ctx.params;

    try {
      if (!_.isEmpty(fields)) {
        select = {};
        fields.split(',').forEach((value) => {
          select[value] = 1;
        });
      }

      let article;
      if (filterKey === 'id') {
        article = await articleModel.find(filterValue, 'id', {}, select);
      } else if (filterKey === 'url') {
        article = await articleModel.find({ url: filterValue }, 'one', {}, select);
      }

      if (_.isNil(article)) {
        articleErrorResponse(ctx, 1003);
        return;
      }
      articleSuccessResponse(ctx, 1002, HTTPStatus.OK, article);
    } catch (error) {
      articleErrorResponse(ctx, 1004, HTTPStatus.INTERNAL_SERVER_ERROR, error);
    }
  });

  /**
   * @api {get} /articles/:articleId/comments Get article's comments
   * @apiVersion 0.1.0
   * @apiName GetComments
   * @apiGroup Comment
   * @apiPermission anyone
   * @apiDescription Get article's comments
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
   * @apiParam {Number} [fields=title,begins] specific data's fields
   * @apiParam {Number} [limit=10] the limit of query amount
   * @apiParam {Number} [offset=0] start query tags at which number
   * @apiParam {String} [direct='desc'] sort is desc or asc
   * @apiParam {String} [sortby='createdAt'] sort data by which field
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Get-Comment
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
   *      "message": "Get comments process failed"
   *    }
   */
  api.get('/articles/:articleId/comments', validateParameters('get/articles/:articleId/comments'), async (ctx) => {
    const { articleId } = ctx.params;
    let {
      offset = 0,
      limit = 10,
      direct = 'desc',
    } = ctx.query;
    const { sortby = 'createdAt', fields = '' } = ctx.query;

    if (!_.isInteger(offset)) offset = _.toInteger(offset);
    if (offset < 0) offset = 0;
    if (!_.isInteger(limit)) limit = _.toInteger(limit);
    if (limit > 10 || limit < 0) limit = 10;
    if (direct !== 'desc' && direct !== 'asc') direct = 'desc';

    const sort = {};
    sort[sortby] = direct;

    const options = {
      sort,
      limit,
      select: {},
      skip: offset,
    };

    if (!_.isEmpty(fields)) {
      fields.split(',').forEach((value) => {
        options.select[value] = 1;
      });
    }

    try {
      const article = await articleModel.find(articleId, 'id');
      if (_.isNil(article)) {
        articleErrorResponse(ctx, 1003);
        return;
      }

      const comments = await commentModel.find({ article_id: articleId }, 'all', options);
      commentSuccessResponse(ctx, 1001, HTTPStatus.OK, comments);
    } catch (error) {
      commentErrorResponse(ctx, 1001, HTTPStatus.INTERNAL_SERVER_ERROR, error);
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
   * @apiParam {String} [url] article's url and this should be unique
   * @apiParam {String} [category] article's category
   * @apiParam {String} [pageView] article's pageView
   * @apiParam {String} [likeCount] article's like
   * @apiParam {String[]} [coverImages] an array of photos' url
   * @apiParamExample {params} Create-Tags
   *    {
   *      "title": "JavaScript builds everything",
   *      "content": "I love it",
   *      "url": "javascript-builds-everything",
   *      "coverImages": [ "https://www.google.com" ],
   *      "category": [ "frontend", "reactjs", "nextjs" ],
   *      "pageView": 1,
   *      "likeCount": 1
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
  api.put('/articles/:articleId', verifyToken, validateParameters('put/articles/:articleId'), async (ctx) => {
    const { articleId } = ctx.params;
    const {
      url,
      category,
      pageView = 0,
      likeCount = 0,
      ...options
    } = ctx.request.body;
    if (_.isEmpty(url) && _.isEmpty(options)) {
      articleErrorResponse(ctx, 1005);
      return;
    }

    try {
      const article = await articleModel.find(articleId, 'id');
      if (_.isNil(article)) {
        articleErrorResponse(ctx, 1003);
        return;
      }

      if (!_.isEmpty(url)) {
        const existArticle = await articleModel.find({ url }, 'one');
        if (existArticle && existArticle.id !== articleId) {
          articleErrorResponse(ctx, 1000);
          return;
        }
        options.url = url;
      }
      if (!_.isEmpty(category)) options.category = category.join('>');

      const params = {
        $set: options,
      };

      if (pageView > 0) {
        params.$inc = { pageView: 1 };
      }
      if (likeCount > 0) {
        if (_.has(params, '$inc')) {
          params.$inc.likeCount = 1;
        } else {
          params.$inc = { likeCount: 1 };
        }
      }

      await articleModel.find(articleId, 'idu', params);
      articleSuccessResponse(ctx, 1003);
    } catch (error) {
      articleErrorResponse(ctx, 1006, HTTPStatus.INTERNAL_SERVER_ERROR, error);
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
  api.put('/articles/:articleId/tags', verifyToken, validateParameters('put/articles/:articleId/tags'), async (ctx) => {
    const { articleId } = ctx.params;
    const { push = [], pull = [] } = ctx.request.body;
    const diff = _.intersectionWith(push, pull, _.isEqual);

    try {
      if (!_.isEmpty(diff)) {
        _.forEach(diff, (value) => {
          push.pop(value);
          pull.pop(value);
        });
      }
      const article = await articleModel.find(articleId, 'id');
      if (_.isNil(article)) {
        articleErrorResponse(ctx, 1003);
        return;
      }

      const promises = [];
      if (!_.isEmpty(push)) {
        _.forEach(push, (tagId) => {
          const pushPromise = new Promise(async (resolve) => {
            try {
              const tag = await tagModel.find(tagId, 'id');
              await tagModel.find(tag._id, 'idu', { $push: { articles: articleId } });
              return resolve();
            } catch (error) {
              return resolve(`Server Error: tag ${tagId} is not existed`);
            }
          });
          promises.push(pushPromise);
        });
      }
      if (!_.isEmpty(pull)) {
        _.forEach(pull, (tagId) => {
          const pullPromise = new Promise(async (resolve) => {
            try {
              const tag = await tagModel.find(tagId, 'id');
              await tagModel.find(tag._id, 'idu', { $pull: { articles: articleId } });
              return resolve();
            } catch (error) {
              return resolve(`Server Error: tag ${tagId} is not existed`);
            }
          });
          promises.push(pullPromise);
        });
      }

      const results = await Promise.all(promises);
      results.forEach((value) => {
        if (_.isNil(value)) results.pop(value);
      });
      if (_.isNil(results[0])) articleSuccessResponse(ctx, 1004);
      else articleSuccessResponse(ctx, 1004, HTTPStatus.OK, results);
    } catch (error) {
      articleErrorResponse(ctx, 1007, HTTPStatus.INTERNAL_SERVER_ERROR, error);
    }
  });

  /**
   * @api {put} /articles/publish/blog Publish or unpublish articles
   * @apiVersion 0.1.0
   * @apiName PublishArticles
   * @apiGroup Article
   * @apiPermission admin
   * @apiDescription Publish or unpublish articles
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
   * @apiParam {String} articleId true is publish and false is unpublish
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
  api.put('/articles/publish/blog', verifyToken, async (ctx) => {
    const publishedAt = new Date();
    const params = ctx.request.body;

    try {
      const results = await Promise.all(_.map(params, (publish, articleId) => {
        const promise = new Promise(async (resolve) => {
          try {
            await articleModel.find(articleId, 'id');
            const options = {};
            if (publish === 'true' || publish === true) {
              options.$set = { publishedAt };
            } else {
              options.$unset = { publishedAt: 1 };
            }
            await articleModel.find(articleId, 'idu', options);
            resolve();
          } catch (error) {
            resolve(`Server Error: article ${articleId} is not existed`);
          }
        });
        return promise;
      }));

      results.forEach((value) => {
        if (_.isNil(value)) results.pop(value);
      });

      if (_.isNil(results[0])) articleSuccessResponse(ctx, 1005);
      else articleSuccessResponse(ctx, 1005, HTTPStatus.OK, results);
    } catch (error) {
      articleErrorResponse(ctx, 1008, HTTPStatus.INTERNAL_SERVER_ERROR, error);
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
  api.delete('/articles/:articleId', verifyToken, validateParameters('delete/articles/:articleId'), async (ctx) => {
    const { articleId } = ctx.params;

    try {
      const article = await articleModel.find(articleId, 'id');
      if (_.isNil(article)) {
        articleErrorResponse(ctx, 1003);
        return;
      }

      await articleModel.find(articleId, 'idu', { deletedAt: new Date() });
      articleSuccessResponse(ctx, 1006, HTTPStatus.OK);
    } catch (error) {
      articleErrorResponse(ctx, 1009, HTTPStatus.INTERNAL_SERVER_ERROR);
    }
  });
};
