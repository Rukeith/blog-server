const _ = require('lodash');
const moment = require('moment');
const request = require('supertest');
const HTTPStatus = require('http-status');
const app = require('../../index.js');
const { Article, Tag } = require('../../model/schema');
const langUS = require('../../locales/us.json');
const errorLevel = require('../../config/error.json');

describe('[Route] article', () => {
  afterEach(() => Article.remove({}));

  describe('Create article', () => {
    afterEach(() => Tag.remove({}));

    test('Error: article\'s url have been used', async () => {
      const now = moment().valueOf();
      const articleUrl = `jest-test-url-${moment().valueOf()}`;
      await Article.create({
        url: articleUrl,
        title: `jest-test-title-${now}`,
        begins: `jest-test-begins-${now}`,
        content: `jest-test-content-${now}`,
      });

      const newTime = moment().valueOf();
      const response = await request(app.callback())
        .post('/articles').send({
          url: articleUrl,
          title: `jest-test-title-${newTime}`,
          begins: `jest-test-begins-${newTime}`,
          content: `jest-test-content-${newTime}`,
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('status', HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('level', errorLevel['articleApi-1000']);
      expect(body).toHaveProperty('message', langUS['error-articleApi-1000']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Error: article with unexisted tag', async () => {
      const now = moment().valueOf();
      const response = await request(app.callback())
        .post('/articles').send({
          title: `jest-test-title-${now}`,
          begins: `jest-test-begins-${now}`,
          content: `jest-test-content-${now}`,
          tags: ['test'],
          coverImages: ['https://www.google.com'],
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('message', langUS['error-articleApi-1001']);
      expect(body).toHaveProperty('level', errorLevel['articleApi-1001']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Success: create article with url is default, tag and coverImages have duplicate values', async () => {
      let tag = await Tag.create({ name: `jest-test-${moment().valueOf()}` });
      const now = moment().valueOf();
      const response = await request(app.callback())
        .post('/articles').send({
          title: `jest-test-title-${now}`,
          begins: `jest-test-begins-${now}`,
          content: `jest-test-content-${now}`,
          tags: [tag.id, tag.id],
          coverImages: ['https://www.google.com', 'https://www.google.com', 'https://www.yahoo.com'],
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.CREATED);
      expect(body).toHaveProperty('status', HTTPStatus.CREATED);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1000']);
      expect(body).not.toHaveProperty('data');

      tag = await Tag.findById(tag.id);
      const tagJson = tag.toJSON();
      const article = await Article.findOne({ title: { $eq: `jest-test-title-${now}` } });
      const articleJson = article.toJSON();
      expect(tagJson).toHaveProperty('articles', [article._id]);
      expect(articleJson).toHaveProperty('url');
      expect(articleJson).toHaveProperty('coverImages', ['https://www.google.com', 'https://www.yahoo.com']);
    });

    test('Success: create article with url and without tags', async () => {
      const now = moment().valueOf();
      const response = await request(app.callback())
        .post('/articles').send({
          url: `jest-test-url-${now}`,
          title: `jest-test-title-${now}`,
          begins: `jest-test-begins-${now}`,
          content: `jest-test-content-${now}`,
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.CREATED);
      expect(body).toHaveProperty('status', HTTPStatus.CREATED);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1000']);
      expect(body).not.toHaveProperty('data');

      const article = await Article.findOne({ title: { $eq: `jest-test-title-${now}` } });
      const articleJson = article.toJSON();
      expect(articleJson).toHaveProperty('url', article.url);
      expect(articleJson).toHaveProperty('title', article.title);
      expect(articleJson).toHaveProperty('begins', article.begins);
      expect(articleJson).toHaveProperty('content', article.content);
    });
  });

  describe('Get articles', () => {
    let TEST_ARTICLES = [];

    beforeEach(async () => {
      TEST_ARTICLES = [];
      const timestamp = moment().valueOf();
      const article1 = await Article.create({
        url: `jest-test-url-${timestamp}`,
        title: `jest-test-title-${timestamp}`,
        begins: `jest-test-begins-${timestamp}`,
        content: `jest-test-content-${timestamp}`,
      });
      const article2 = await Article.create({
        url: `jest-test-url-${timestamp + 1}`,
        title: `jest-test-title-${timestamp + 1}`,
        begins: `jest-test-begins-${timestamp + 1}`,
        content: `jest-test-content-${timestamp + 1}`,
      });
      TEST_ARTICLES.push(article2);
      TEST_ARTICLES.push(article1);
    });

    test('Success: query tags with invalid query parameters', async () => {
      const response = await request(app.callback())
        .get('/articles').query({ limit: -1, offset: -1, direct: 'test' });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1001']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(2);
      _.forEach(body.data, (data, index) => {
        expect(data).toHaveProperty('id', TEST_ARTICLES[index].id);
        expect(data).toHaveProperty('url');
        expect(data).toHaveProperty('title', TEST_ARTICLES[index].title);
        expect(data).toHaveProperty('begins', TEST_ARTICLES[index].begins);
        expect(data).toHaveProperty('coverImages', []);
        expect(data).toHaveProperty('createdAt');
      });
    });

    test('Success: query tags with limit and offset', async () => {
      const response = await request(app.callback())
        .get('/articles').query({ limit: 1, offset: 1 });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1001']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(1);
      _.forEach(body.data, (data) => {
        expect(data).toHaveProperty('id', TEST_ARTICLES[1].id);
        expect(data).toHaveProperty('url', TEST_ARTICLES[1].url);
        expect(data).toHaveProperty('title', TEST_ARTICLES[1].title);
        expect(data).toHaveProperty('begins', TEST_ARTICLES[1].begins);
        expect(data).toHaveProperty('createdAt');
        expect(data).toHaveProperty('coverImages', []);
      });
    });

    test('Success: query tags with sortby and direct', async () => {
      const response = await request(app.callback())
        .get('/articles').query({ sortby: 'createdAt', direct: 'asc' });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1001']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(2);
      _.forEach(body.data, (data, index) => {
        const newIndex = (index === 0) ? 1 : 0;
        expect(data).toHaveProperty('id', TEST_ARTICLES[newIndex].id);
        expect(data).toHaveProperty('url', TEST_ARTICLES[newIndex].url);
        expect(data).toHaveProperty('title', TEST_ARTICLES[newIndex].title);
        expect(data).toHaveProperty('begins', TEST_ARTICLES[newIndex].begins);
        expect(data).toHaveProperty('createdAt');
        expect(data).toHaveProperty('coverImages', []);
      });
    });
  });

  describe('Get single article', () => {
    let TEST_ARTICLE;

    beforeEach(async () => {
      const now = moment().valueOf();
      TEST_ARTICLE = await Article.create({
        url: `jest-test-url-${now}`,
        title: `jest-test-title-${now}`,
        begins: `jest-test-begins-${now}`,
        content: `jest-test-content-${now}`,
      });
    });

    test('Error: get single article with not existed article id', async () => {
      const response = await request(app.callback()).get('/articles/test');

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('level', errorLevel['articleApi-1004']);
      expect(body).toHaveProperty('message', langUS['error-articleApi-1004']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Success: get single article', async () => {
      const response = await request(app.callback()).get(`/articles/${TEST_ARTICLE.id}`);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1002']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id', TEST_ARTICLE.id);
      expect(body.data).toHaveProperty('url', TEST_ARTICLE.url);
      expect(body.data).toHaveProperty('title', TEST_ARTICLE.title);
      expect(body.data).toHaveProperty('begins', TEST_ARTICLE.begins);
      expect(body.data).toHaveProperty('content', TEST_ARTICLE.content);
      expect(body.data).toHaveProperty('createdAt');
      expect(body.data).toHaveProperty('updatedAt');
    });
  });

  describe('Update article', () => {
    let TEST_ARTICLE;

    beforeEach(async () => {
      const now = moment().valueOf();
      TEST_ARTICLE = await Article.create({
        url: `jest-test-url-${now}`,
        title: `jest-test-title-${now}`,
        begins: `jest-test-begins-${now}`,
        content: `jest-test-content-${now}`,
      });
    });

    test('Error: update article without parameters', async () => {
      const response = await request(app.callback()).put('/articles/test');

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('status', HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('level', errorLevel['articleApi-1005']);
      expect(body).toHaveProperty('message', langUS['error-articleApi-1005']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Error: update article with another article\'s url', async () => {
      const now = moment().valueOf();
      const article = await Article.create({
        url: `jest-test-url-${now}`,
        title: `jest-test-title-${now}`,
        begins: `jest-test-begins-${now}`,
        content: `jest-test-content-${now}`,
      });

      const response = await request(app.callback())
        .put(`/articles/${TEST_ARTICLE.id}`).send({ url: article.url });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('status', HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('level', errorLevel['articleApi-1000']);
      expect(body).toHaveProperty('message', langUS['error-articleApi-1000']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Error: update article not existed id', async () => {
      const response = await request(app.callback())
        .put('/articles/test').send({ title: `jest-test-title-${moment().valueOf()}` });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('level', errorLevel['articleApi-1006']);
      expect(body).toHaveProperty('message', langUS['error-articleApi-1006']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Success: update article', async () => {
      const articleUrl = `jest-test-url-${moment().valueOf()}`;
      const response = await request(app.callback())
        .put(`/articles/${TEST_ARTICLE.id}`).send({ url: articleUrl });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1003']);
      expect(body).not.toHaveProperty('data');

      const article = await Article.findById(TEST_ARTICLE.id);
      const articleJson = article.toJSON();
      expect(articleJson).toHaveProperty('url', articleUrl);
      expect(articleJson.createdAt).not.toBe(articleJson.updatedAt);
    });
  });

  describe('Update article\'s tags ', () => {
    let TEST_PUSH_TAG;
    let TEST_PULL_TAG;
    let TEST_ARTICLE;

    beforeEach(async () => {
      const now = moment().valueOf();
      TEST_ARTICLE = await Article.create({
        url: `jest-test-url-${now}`,
        title: `jest-test-title-${now}`,
        begins: `jest-test-begins-${now}`,
        content: `jest-test-content-${now}`,
      });

      TEST_PUSH_TAG = await Tag.create({
        name: `jest-test-push-${now}`,
        articles: [TEST_ARTICLE.id],
      });
      TEST_PULL_TAG = await Tag.create({ name: `jest-test-pull-${now}` });
    });

    afterEach(() => Tag.remove({}));

    test('Error: update article\'s tags with unexisted id', async () => {
      const response = await request(app.callback())
        .put('/articles/test/tags');

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('level', errorLevel['articleApi-1007']);
      expect(body).toHaveProperty('message', langUS['error-articleApi-1007']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Success: update article\'s tags push with invalid tags ', async () => {
      const response = await request(app.callback())
        .put(`/articles/${TEST_ARTICLE.id}/tags`).send({ push: ['test', TEST_PULL_TAG.id] });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1004']);
      expect(body).toHaveProperty('data', ['Server Error: tag test is not existed']);

      const tag = await Tag.findById(TEST_PULL_TAG.id);
      const tagJson = tag.toJSON();
      expect(tagJson).toHaveProperty('articles', [TEST_ARTICLE._id]);
    });

    test('Success: update article\'s tags pull with invalid tags ', async () => {
      const response = await request(app.callback())
        .put(`/articles/${TEST_ARTICLE.id}/tags`).send({ pull: ['test', TEST_PUSH_TAG.id] });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1004']);
      expect(body).toHaveProperty('data', ['Server Error: tag test is not existed']);

      const tag = await Tag.findById(TEST_PUSH_TAG.id);
      const tagJson = tag.toJSON();
      expect(tagJson).toHaveProperty('articles', []);
    });

    test('Success: update article\'s tags pull and push with same tags ', async () => {
      const response = await request(app.callback())
        .put(`/articles/${TEST_ARTICLE.id}/tags`).send({
          push: [TEST_PUSH_TAG.id],
          pull: [TEST_PUSH_TAG.id],
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1004']);
      expect(body).not.toHaveProperty('data');

      const tag = await Tag.findById(TEST_PUSH_TAG.id);
      const tagJson = tag.toJSON();
      expect(tagJson).toHaveProperty('articles', [TEST_ARTICLE._id]);
    });

    test('Success: update article\'s tags pull with invalid tags ', async () => {
      const response = await request(app.callback())
        .put(`/articles/${TEST_ARTICLE.id}/tags`).send({
          push: [TEST_PULL_TAG.id],
          pull: [TEST_PUSH_TAG.id],
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1004']);
      expect(body).not.toHaveProperty('data');

      const [pullTag, pushTag] = await Promise.all([
        Tag.findById(TEST_PUSH_TAG.id),
        Tag.findById(TEST_PULL_TAG.id),
      ]);
      const pullTagJson = pullTag.toJSON();
      const pushTagJson = pushTag.toJSON();
      expect(pullTagJson).toHaveProperty('articles', []);
      expect(pushTagJson).toHaveProperty('articles', [TEST_ARTICLE._id]);
    });
  });

  describe('Publish articles', () => {
    let TEST_PUBLISH_ARTICLE;
    let TEST_UNPUBLISH_ARTICLE;

    beforeEach(async () => {
      const now = moment().valueOf();
      TEST_PUBLISH_ARTICLE = await Article.create({
        publishedAt: new Date(),
        url: `jest-test-url-${now}`,
        title: `jest-test-title-${now}`,
        begins: `jest-test-begins-${now}`,
        content: `jest-test-content-${now}`,
      });

      TEST_UNPUBLISH_ARTICLE = await Article.create({
        url: `jest-test-url-${now + 1}`,
        title: `jest-test-title-${now + 1}`,
        begins: `jest-test-begins-${now + 1}`,
        content: `jest-test-content-${now + 1}`,
      });
    });

    test('Success: publish articles with invalid article id ', async () => {
      const response = await request(app.callback())
        .put('/articles/publish/blog').send({ test: 'test' });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1005']);
      expect(body).toHaveProperty('data', ['Server Error: article test is not existed']);
    });

    test('Success: publish articles', async () => {
      const params = {};
      params[TEST_PUBLISH_ARTICLE.id] = false;
      params[TEST_UNPUBLISH_ARTICLE.id] = true;
      const response = await request(app.callback())
        .put('/articles/publish/blog').send(params);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1005']);
      expect(body).not.toHaveProperty('data');

      const [unpublishArticle, publishArticle] = await Promise.all([
        Article.findById(TEST_PUBLISH_ARTICLE.id),
        Article.findById(TEST_UNPUBLISH_ARTICLE.id),
      ]);
      const publishArticleJson = publishArticle.toJSON();
      const unpublishArticleJson = unpublishArticle.toJSON();
      expect(publishArticleJson).toHaveProperty('publishedAt');
      expect(unpublishArticleJson).not.toHaveProperty('publishedAt');
    });
  });

  describe('Delete article', () => {
    let TEST_ARTICLE;
    let TEST_DELETE_ARTICLE;

    beforeEach(async () => {
      const now = moment().valueOf();
      TEST_ARTICLE = await Article.create({
        url: `jest-test-url-${now}`,
        title: `jest-test-title-${now}`,
        begins: `jest-test-begins-${now}`,
        content: `jest-test-content-${now}`,
      });
      TEST_DELETE_ARTICLE = await Article.create({
        deletedAt: new Date(),
        url: `jest-test-url-${now + 1}`,
        title: `jest-test-title-${now + 1}`,
        begins: `jest-test-begins-${now + 1}`,
        content: `jest-test-content-${now + 1}`,
      });
    });

    test('Error: delete article with not existed id', async () => {
      const response = await request(app.callback()).del('/articles/test');

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('level', errorLevel['articleApi-1009']);
      expect(body).toHaveProperty('message', langUS['error-articleApi-1009']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Error: delete article with deleted article', async () => {
      const response = await request(app.callback()).del(`/articles/${TEST_DELETE_ARTICLE.id}`);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('status', HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('level', errorLevel['articleApi-1003']);
      expect(body).toHaveProperty('message', langUS['error-articleApi-1003']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Success: delete article', async () => {
      const response = await request(app.callback()).del(`/articles/${TEST_ARTICLE.id}`);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-articleApi-1006']);
      expect(body).not.toHaveProperty('data');

      const article = await Article.findById(TEST_ARTICLE.id);
      const articleJson = article.toJSON();
      expect(articleJson).toHaveProperty('deletedAt');
    });
  });
});
