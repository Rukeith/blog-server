const _ = require('lodash');
const moment = require('moment');
const request = require('supertest');
const HTTPStatus = require('http-status');
const app = require('../../index.js');
const { Article, Tag } = require('../../model/schema');
const langUS = require('../../locales/us.json');
const errorLevel = require('../../config/error.json');

describe('[Route] tag', () => {
  afterEach(() => Tag.remove({}));

  describe('Create tag', () => {
    test('Error: name is empty', async () => {
      const response = await request(app.callback())
        .post('/tags').send({ names: [' '] });
      const { body, status } = response;
      expect(status).toBe(HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('status', HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('level', errorLevel['tagApi-1000']);
      expect(body).toHaveProperty('message', langUS['error-tagApi-1000']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Success: names are duplicate', async () => {
      const name = `jest-test-${moment().valueOf()}`;
      const names = [name, name];
      const response = await request(app.callback())
        .post('/tags').send({ names });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.CREATED);
      expect(body).toHaveProperty('status', HTTPStatus.CREATED);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1000']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(1);
      _.forEach(body.data, (data) => {
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name', name);
      });

      const tags = await Tag.find({ name });
      expect(tags).toHaveLength(1);
      _.forEach(tags, (tag) => {
        const tagJson = tag.toJSON();
        expect(tagJson).toHaveProperty('_id');
        expect(tagJson).toHaveProperty('name', name);
        expect(tagJson).toHaveProperty('createdAt');
        expect(tagJson).toHaveProperty('updatedAt');
        expect(tagJson).toHaveProperty('articles', []);
        expect(tagJson).toHaveProperty('__v', 0);
      });
    });

    test('Success: create tag with existed name', async () => {
      const name = `jest-test-${moment().valueOf()}`;
      const existdTag = await Tag.create({ name });

      const response = await request(app.callback())
        .post('/tags').send({ names: [name] });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.CREATED);
      expect(body).toHaveProperty('status', HTTPStatus.CREATED);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1000']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(1);
      _.forEach(body.data, (data) => {
        expect(data).toHaveProperty('id', existdTag.id);
        expect(data).toHaveProperty('name', name);
      });

      const tags = await Tag.find({ name });
      expect(tags).toHaveLength(1);
      _.forEach(tags, (tag) => {
        const tagJson = tag.toJSON();
        expect(tagJson).toHaveProperty('_id', existdTag._id);
        expect(tagJson).toHaveProperty('name', name);
        expect(tagJson).toHaveProperty('createdAt');
        expect(tagJson).toHaveProperty('updatedAt');
        expect(tagJson).toHaveProperty('articles', []);
        expect(tagJson).toHaveProperty('__v', 0);
        expect(tagJson.createdAt).not.toBe(tagJson.updatedAt);
      });
    });
  });

  describe('Get tags', () => {
    let TEST_TAGS = [];

    beforeEach(async () => {
      TEST_TAGS = [];
      const timestamp = moment().valueOf();
      const tagName1 = `jest-test-${timestamp}`;
      const tagName2 = `jest-test-${timestamp + 1}`;
      const tag1 = await Tag.create({ name: tagName1 });
      TEST_TAGS.push(tag1);
      const tag2 = await Tag.create({ name: tagName2 });
      TEST_TAGS.push(tag2);
    });

    afterAll(() => Article.remove({}));

    test('Success: query tags with invalid query parameters', async () => {
      const response = await request(app.callback())
        .get('/tags').query({ limit: -1, offset: -1, direct: 'test' });
      const { body, status } = response;

      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1001']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(2);
      _.forEach(body.data, (data) => {
        expect(data).toHaveProperty('articles', { amount: 0, content: [] });
      });
    });

    test('Success: query tags with limit and offset', async () => {
      const response = await request(app.callback())
        .get('/tags').query({ limit: 1, offset: 1 });
      const { body, status } = response;

      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1001']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(1);
      _.forEach(body.data, (data) => {
        expect(data).toHaveProperty('id', TEST_TAGS[0].id);
        expect(data).toHaveProperty('name', TEST_TAGS[0].name);
        expect(data).toHaveProperty('articles', { amount: 0, content: [] });
      });
    });

    test('Success: query tags with sortby and direct', async () => {
      const response = await request(app.callback())
        .get('/tags').query({ sortby: 'createdAt', direct: 'asc' });
      const { body, status } = response;

      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1001']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(2);
      _.forEach(body.data, (data, index) => {
        expect(data).toHaveProperty('id', TEST_TAGS[index].id);
        expect(data).toHaveProperty('name', TEST_TAGS[index].name);
        expect(data).toHaveProperty('articles', { amount: 0, content: [] });
      });
    });

    test('Success: query tags with article', async () => {
      const article = await Article.create({
        title: `jest-test-title-${moment().valueOf()}`,
        begins: `jest-test-begins-${moment().valueOf()}`,
        content: `jest-test-content-${moment().valueOf()}`,
        url: `jest-test-url-${moment().valueOf()}`,
      });
      TEST_TAGS[0].articles.addToSet(article.id);
      await TEST_TAGS[0].save();
      TEST_TAGS[1].articles.addToSet(article.id);
      await TEST_TAGS[1].save();
      const response = await request(app.callback())
        .get('/tags').query({ direct: 'asc' });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1001']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveLength(2);

      _.forEach(body.data, (data, index) => {
        expect(data).toHaveProperty('id', TEST_TAGS[index].id);
        expect(data).toHaveProperty('name', TEST_TAGS[index].name);
        expect(data).toHaveProperty('articles');
        expect(data.articles).toHaveProperty('amount', 1);
        expect(data.articles).toHaveProperty('content');
        expect(data.articles.content).toHaveLength(1);

        _.forEach(data.articles.content, (content) => {
          expect(content).toHaveProperty('id', article.id);
          expect(content).toHaveProperty('url', article.url);
          expect(content).toHaveProperty('title', article.title);
          expect(content).toHaveProperty('begins', article.begins);
          expect(content).toHaveProperty('coverImages', []);
        });
      });
    });
  });
});
