const _ = require('lodash');
const HTTPStatus = require('http-status');
const ArticleModel = require('../model/article.js');

const articleModel = new ArticleModel();

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
   * @apiParam {String} [url] article's url and this should be unique
   * @apiParam {String[]} [tags] an array of tags' id which this article will reference to
   * @apiParam {String[]} [coverImages] an array of photos' url
   * @apiParamExample {params} Create-Tags
   *    {
   *      "title": "JavaScript builds everything",
   *      "content": "I love it",
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
  api.post('/articles', async (ctx) => {});

  /**
   * @api {get} /articles?offset=0&limit=10 Get articles
   * @apiVersion 0.1.0
   * @apiName GetArticles
   * @apiGroup Article
   * @apiPermission admin
   * @apiDescription Get articles which will only return id, title,
   *  first cover image, createdAt and url.
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
  api.get('/articles', async (ctx) => {});

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
  api.get('/articles/:articleId', async (ctx) => {});

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
   * @apiParam {String[]} [coverImages] an array of photos' url
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
  api.put('/articles/:articleId', async (ctx) => {});

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
   * @apiParam {String[]} push tags which want to add to article
   * @apiParam {String[]} pop tags which want to remove from article
   * @apiParamExample {params} Create-Tags
   *    {
   *      "push": [ "507f1f77bcf86cd799439011" ],
   *      "pop": [ "507f1f77bcf86cd799439011" ],
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
  api.put('/articles/:articleId/tags', async (ctx) => {});

  /**
   * @api {put} /articles/publish Publish or dispublish articles
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
   * @apiParamExample {params} Publish-Articles
   *    {
   *      "507f1f77bcf86cd799439011": true, // Publish
   *      "507f1f77bcf86cd799439011": false // Dispublish
   *    }
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
  api.put('/articles/publish', async (ctx) => {});

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
  api.delete('/articles/:articleId', async (ctx) => {});
};
