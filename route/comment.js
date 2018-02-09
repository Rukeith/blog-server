const _ = require('lodash');
const HTTPStatus = require('http-status');
const CommentModel = require('../model/comment.js');
const { verifyToken } = require('../middleware/auth.js');
const { validateParameters } = require('../middleware/data.js');
const { successResponse, errorResponse } = require('../controller/parse.js');

const commentModel = new CommentModel();

const commentSuccessResponse = (ctx, code, status = HTTPStatus.OK, data) => successResponse(ctx, [status, 'comment', 'api', code, data]);
const commentErrorResponse = (ctx, code, status = HTTPStatus.BAD_REQUEST, error) => errorResponse(ctx, [status, 'comment', 'api', code, error]);

module.exports = (api) => {
  /**
   * @api {put} /comments/:commentId Update comment
   * @apiVersion 0.1.0
   * @apiName UpdateComment
   * @apiGroup Comment
   * @apiPermission admin
   * @apiDescription Update comment
   *
   * @apiHeader {String} Rukeith-Token Access token
   * @apiHeaderExample {json} Token-Example
   *    {
   *      "Rukeith-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
   *        eyJpZCI6IjA4YjcyMjZjLTU1MjQtNDY3YS1iMDk0LTRkN2U1M2VjM
   *        TE0NCIsImlhdCI6MTUwNTIwNTczNSwiZXhwIjoxNTA1ODEwNTM1LCJpc3MiOiJpc3RhZ2luZyJ9.
   *        x3aQQOcF4JM30sUSWjUUpiy8BoXq7QYwnG9y8w0BgZc"
   *    }
   * @apiParam {String} commentId comment's id
   * @apiParam {String} context Comment text
   * @apiParamExample {params} Update-Comment
   *    {
   *      "context": "Test"
   *    }
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Update-Comment
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
  api.put('/comments/:commentId', verifyToken, validateParameters('put/comments/:commentId'), async (ctx) => {
    const { commentId } = ctx.params;
    const { context } = ctx.request.body;

    try {
      const comment = await commentModel.find(commentId, 'id');
      if (_.isNil(comment)) {
        commentErrorResponse(ctx, 1002);
        return;
      }

      await commentModel.find(commentId, 'idu', { $set: { context } });
      commentSuccessResponse(ctx, 1002);
    } catch (error) {
      commentErrorResponse(ctx, 1003, HTTPStatus.INTERNAL_SERVER_ERROR, error);
    }
  });

  /**
   * @api {delete} /comments/:commentId Delete comment
   * @apiVersion 0.1.0
   * @apiName DeleteComment
   * @apiGroup Comment
   * @apiPermission admin
   * @apiDescription Delete comment
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
   * @apiParam {String} commentId comment's id
   *
   * @apiSuccess {Number} status HTTP Status code
   * @apiSuccess {String} message Info message
   * @apiSuccessExample {json} Delete-Comment
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
  api.delete('/comments/:commentId', verifyToken, validateParameters('delete/comments/:commentId'), async (ctx) => {
    const { commentId } = ctx.params;

    try {
      const comment = await commentModel.find(commentId, 'id');
      if (_.isNil(comment)) {
        commentErrorResponse(ctx, 1002);
        return;
      }

      await commentModel.find(commentId, 'idu', { deletedAt: new Date() });
      commentSuccessResponse(ctx, 1003);
    } catch (error) {
      commentErrorResponse(ctx, 1004, HTTPStatus.INTERNAL_SERVER_ERROR, error);
    }
  });
};
