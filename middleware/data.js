const HTTPStatus = require('http-status');
const { errorResponse } = require('../controller/parse.js');

module.exports = {
  /**
   * @name validateParameters
   * @desc check parameters at request body is correct or not
   * @param {string} path the path which middleware will check
   */
  validateParameters: path => async (ctx, next) => {
    try {
      switch (path) {
        // Article
        case 'post/articles':
          ctx.verifyParams({
            title: { type: 'string' },
            begins: { type: 'string' },
            content: { type: 'string' },
            url: { type: 'string', required: false },
            tags: { type: 'array', itemType: 'string', required: false },
            coverImages: { type: 'array', itemType: 'url', required: false },
          });
          break;
        case 'get/articles':
          ctx.verifyParams({
            sortby: { type: 'string', required: false },
            direct: { type: 'string', required: false },
            offset: { type: 'int', min: 0, required: false },
            limit: {
              type: 'int', min: 0, max: 100, required: false,
            },
          });
          break;
        case 'get/articles/:articleId':
          ctx.verifyParams({
            articleId: { type: 'string' },
          });
          break;
        case 'put/articles/:articleId':
          ctx.verifyParams({
            articleId: { type: 'string' },
            title: { type: 'string', required: false },
            content: { type: 'string', required: false },
            url: { type: 'url', required: false },
            coverImages: { type: 'array', itemType: 'url', required: false },
          });
          break;
        case 'put/articles/:articleId/tags':
          ctx.verifyParams({
            articleId: { type: 'string' },
            pop: { type: 'array', itemType: 'striing', required: false },
            push: { type: 'array', itemType: 'striing', required: false },
          });
          break;
        case 'delete/articles/:articleId':
          ctx.verifyParams({
            articleId: { type: 'string' },
          });
          break;
        // Tag
        case 'post/tags':
          ctx.verifyParams({
            names: { type: 'array', itemType: 'string' },
          });
          break;
        case 'get/tags':
          ctx.verifyParams({
            sortby: { type: 'string', required: false },
            direct: { type: 'string', required: false },
            offset: { type: 'int', min: 0, required: false },
            limit: {
              type: 'int', min: 0, max: 100, required: false,
            },
          });
          break;
        case 'get/tags/:tagId':
          ctx.verifyParams({
            tagId: { type: 'string' },
            sortby: { type: 'string', required: false },
            direct: { type: 'string', required: false },
            offset: { type: 'int', min: 0, required: false },
            limit: {
              type: 'int', min: 0, max: 50, required: false,
            },
          });
          break;
        case 'patch/tags/:tagId':
          ctx.verifyParams({
            tagId: { type: 'string' },
            name: { type: 'string', allowEmpty: false },
          });
          break;
        case 'delete/tags/:tagId':
          ctx.verifyParams({
            tagId: { type: 'string' },
          });
          break;
        default:
          errorResponse(ctx, [HTTPStatus.BAD_REQUEST, 'data', 'middleware', 1000]);
          return;
      }
      await next();
    } catch (error) {
      const err = (error.code === 'INVALID_PARAM') ? JSON.stringify(error.errors) : error;
      errorResponse(ctx, [HTTPStatus.INTERNAL_SERVER_ERROR, 'data', 'middleware', 1001, err]);
    }
  },
};
