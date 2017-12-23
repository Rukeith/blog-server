const jwt = require('jsonwebtoken');
const request = require('supertest');
const { DateTime } = require('luxon');
const HTTPStatus = require('http-status');
const app = require('../../index.js');
const langUS = require('../../locales/us.json');
const errorLevel = require('../../config/error.json');
const { Article, Comment, Session } = require('../../model/schema');

describe('[Route] comment', () => {
  let token;
  let testObj;
  let TEST_ARTICLE;

  beforeEach(async () => {
    const now = DateTime.local().valueOf();
    token = jwt.sign({ ip: '127.0.0.1' }, Buffer.from(process.env.JWT_SECRET), { expiresIn: '5m', issuer: 'rukeith' });
    TEST_ARTICLE = await Article.create({
      url: `jest-test-url-${now}`,
      title: `jest-test-title-${now}`,
      begins: `jest-test-begins-${now}`,
      content: `jest-test-content-${now}`,
    });
    testObj = await Comment.create({
      article_id: TEST_ARTICLE.id,
      username: `jest-test-username-${now}`,
      context: `jest-test-context-${now}`,
    });
    return Session.create({
      token,
      expiredAt: DateTime.local().plus({ minutes: 5 }).toJSDate(),
    });
  });
  afterEach(() => Promise.all([Article.remove({}), Comment.remove({})]));

  describe('Update comment', () => {
    test('Error: update comment not existed id', async () => {
      const response = await request(app.callback())
        .put('/comments/test')
        .set('Rukeith-Token', token)
        .send({ context: `jest-test-context-${DateTime.local().valueOf()}` });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('level', errorLevel['commentApi-1003']);
      expect(body).toHaveProperty('message', langUS['error-commentApi-1003']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Success: update comment', async () => {
      const commentContext = `jest-test-update-context-${DateTime.local().valueOf()}`;
      const response = await request(app.callback())
        .put(`/comments/${testObj.id}`)
        .set('Rukeith-Token', token)
        .send({ context: commentContext });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-commentApi-1002']);
      expect(body).not.toHaveProperty('data');

      const comment = await Comment.findById(testObj.id);
      const commentJson = comment.toJSON();
      expect(commentJson).toHaveProperty('context', commentContext);
      expect(commentJson.createdAt).not.toBe(commentJson.updatedAt);
    });
  });

  describe('Delete article', () => {
    test('Error: delete comment with not existed id', async () => {
      const response = await request(app.callback())
        .del('/comments/test')
        .set('Rukeith-Token', token);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('level', errorLevel['commentApi-1004']);
      expect(body).toHaveProperty('message', langUS['error-commentApi-1004']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Success: delete comment', async () => {
      const response = await request(app.callback())
        .del(`/comments/${testObj.id}`)
        .set('Rukeith-Token', token);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-commentApi-1003']);
      expect(body).not.toHaveProperty('data');

      const comment = await Comment.findById(testObj.id);
      const commentJson = comment.toJSON();
      expect(commentJson).toHaveProperty('deletedAt');
      expect(commentJson.createdAt).not.toBe(commentJson.updatedAt);
    });
  });
});
