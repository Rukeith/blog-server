const _ = require('lodash');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const { DateTime } = require('luxon');
const HTTPStatus = require('http-status');
const app = require('../../index.js');
const { Article, Session, Tag } = require('../../model/schema');
const langUS = require('../../locales/us.json');
const errorLevel = require('../../config/error.json');

describe('[Route] tag', () => {
  let token;
  beforeEach(() => {
    token = jwt.sign({ ip: '127.0.0.1' }, Buffer.from(process.env.JWT_SECRET), { expiresIn: '5m', issuer: 'rukeith' });
    return Session.create({
      token,
      expiredAt: DateTime.local().plus({ minutes: 5 }).toJSDate(),
    });
  });
  afterEach(() => Promise.all([Tag.deleteMany({}), Session.deleteMany({})]));

  describe('Create tag', () => {
    test('Error: name is empty', async () => {
      const response = await request(app.callback())
        .post('/tags')
        .set('Rukeith-Token', token)
        .send({ names: [' '] });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('status', HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('level', errorLevel['tagApi-1000']);
      expect(body).toHaveProperty('message', langUS['error-tagApi-1000']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Success: names are duplicate', async () => {
      const name = `jest-test-${DateTime.local().valueOf()}`;
      const names = [name, name];
      const response = await request(app.callback())
        .post('/tags')
        .set('Rukeith-Token', token)
        .send({ names });

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
      const name = `jest-test-${DateTime.local().valueOf()}`;
      const existdTag = await Tag.create({ name });

      const response = await request(app.callback())
        .post('/tags')
        .set('Rukeith-Token', token)
        .send({ names: [name] });

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
      const timestamp = DateTime.local().valueOf();
      const tagName1 = `jest-test-${timestamp}`;
      const tagName2 = `jest-test-${timestamp + 1}`;
      const tag1 = await Tag.create({ name: tagName1 });
      TEST_TAGS.push(tag1);
      const tag2 = await Tag.create({ name: tagName2 });
      TEST_TAGS.push(tag2);
    });

    afterAll(() => Article.deleteMany({}));

    test('Success: query tags with invalid query parameters', async () => {
      const response = await request(app.callback())
        .get('/tags')
        .query({ limit: -1, offset: -1, direct: 'test' });

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
        .get('/tags')
        .query({ limit: 1, offset: 1 });

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
        .get('/tags')
        .query({ sortby: 'createdAt', direct: 'asc' });

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

    test('Success: query tags with article and articleFields option', async () => {
      const timestamp = DateTime.local().valueOf();
      const article = await Article.create({
        url: `jest-test-url-${timestamp}`,
        title: `jest-test-title-${timestamp}`,
        begins: `jest-test-begins-${timestamp}`,
        content: `jest-test-content-${timestamp}`,
        category: `jest-test-category-${timestamp}`,
      });
      TEST_TAGS[0].articles.addToSet(article.id);
      TEST_TAGS[1].articles.addToSet(article.id);
      await Promise.all([
        TEST_TAGS[0].save(),
        TEST_TAGS[1].save(),
      ]);

      const response = await request(app.callback())
        .get('/tags')
        .query({ direct: 'asc', articleFields: '_id,url,title' });

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
          expect(content).toHaveProperty('_id', article.id);
          expect(content).toHaveProperty('url', article.url);
          expect(content).toHaveProperty('title', article.title);
          expect(content).not.toHaveProperty('begins');
          expect(content).not.toHaveProperty('coverImages');
        });
      });
    });
  });

  describe('Get single tag', () => {
    let TEST_TAG;
    let TEST_DELETE_TAG;
    let TEST_ARTICLES = [];

    beforeEach(async () => {
      TEST_ARTICLES = [];
      const now = DateTime.local().valueOf();
      const article1 = await Article.create({
        url: `jest-test-url-${now}`,
        title: `jest-test-title-${now}`,
        begins: `jest-test-begins-${now}`,
        content: `jest-test-content-${now}`,
        category: `jest-test-category-${now}`,
      });
      TEST_ARTICLES.push(article1);
      const article2 = await Article.create({
        url: `jest-test-url-${now + 1}`,
        title: `jest-test-title-${now + 1}`,
        begins: `jest-test-begins-${now + 1}`,
        content: `jest-test-content-${now + 1}`,
        category: `jest-test-category-${now + 1}`,
      });
      TEST_ARTICLES.unshift(article2);
      TEST_TAG = await Tag.create({ name: `jest-test-${now}`, articles: [article1.id, article2.id] });
      TEST_DELETE_TAG = await Tag.create({
        deletedAt: new Date(),
        name: `jest-test-${now + 1}`,
      });
    });

    afterAll(() => Article.deleteMany({}));

    test('Error: get single tag with deleted tag id', async () => {
      const response = await request(app.callback())
        .get(`/tags/${TEST_DELETE_TAG._id}`);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('status', HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('level', errorLevel['tagApi-1003']);
      expect(body).toHaveProperty('message', langUS['error-tagApi-1003']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Error: get single tag with not existed tag id', async () => {
      const response = await request(app.callback())
        .get('/tags/test');

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('level', errorLevel['tagApi-1004']);
      expect(body).toHaveProperty('message', langUS['error-tagApi-1004']);
      expect(body).toHaveProperty('extra', 'Cast to ObjectId failed for value \"test\" at path \"_id\" for model \"Tag\"');
    });

    test('Success: get single tag', async () => {
      const response = await request(app.callback())
        .get(`/tags/${TEST_TAG.id}`);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1002']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id', TEST_TAG.id);
      expect(body.data).toHaveProperty('name', TEST_TAG.name);
      expect(body.data).toHaveProperty('createdAt');
      expect(body.data).toHaveProperty('updatedAt');
      expect(body.data).toHaveProperty('articles');
      expect(body.data.articles).toHaveLength(2);

      _.forEach(body.data.articles, (article, index) => {
        expect(article).toHaveProperty('_id', TEST_ARTICLES[index].id);
        expect(article).toHaveProperty('url', TEST_ARTICLES[index].url);
        expect(article).toHaveProperty('title', TEST_ARTICLES[index].title);
        expect(article).toHaveProperty('begins', TEST_ARTICLES[index].begins);
        expect(article).toHaveProperty('coverImages', []);
        expect(article).toHaveProperty('createdAt');
        expect(article).toHaveProperty('updatedAt');
      });
    });

    test('Success: get single tag with parameters', async () => {
      const response = await request(app.callback())
        .get(`/tags/${TEST_TAG.id}`)
        .query({
          limit: 1,
          offset: 1,
          direct: 'asc',
          sortby: 'createdAt',
          articleFields: 'url,title',
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1002']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id', TEST_TAG.id);
      expect(body.data).toHaveProperty('name', TEST_TAG.name);
      expect(body.data).toHaveProperty('createdAt');
      expect(body.data).toHaveProperty('updatedAt');
      expect(body.data).toHaveProperty('articles');
      expect(body.data.articles).toHaveLength(1);

      _.forEach(body.data.articles, (article, index) => {
        expect(article).not.toHaveProperty('begins');
        expect(article).not.toHaveProperty('createdAt');
        expect(article).not.toHaveProperty('updatedAt');
        expect(article).not.toHaveProperty('coverImages');
        expect(article).toHaveProperty('_id');
        expect(article).toHaveProperty('url', TEST_ARTICLES[index].url);
        expect(article).toHaveProperty('title', TEST_ARTICLES[index].title);
      });
    });

    test('Success: get single tag with invalid parameters', async () => {
      const response = await request(app.callback())
        .get(`/tags/${TEST_TAG.id}`)
        .query({
          limit: -1,
          offset: -1,
          direct: 'ascx',
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1002']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id', TEST_TAG.id);
      expect(body.data).toHaveProperty('name', TEST_TAG.name);
      expect(body.data).toHaveProperty('createdAt');
      expect(body.data).toHaveProperty('updatedAt');
      expect(body.data).toHaveProperty('articles');
      expect(body.data.articles).toHaveLength(2);

      _.forEach(body.data.articles, (article, index) => {
        expect(article).toHaveProperty('_id', TEST_ARTICLES[index].id);
        expect(article).toHaveProperty('url', TEST_ARTICLES[index].url);
        expect(article).toHaveProperty('title', TEST_ARTICLES[index].title);
        expect(article).toHaveProperty('begins', TEST_ARTICLES[index].begins);
        expect(article).toHaveProperty('coverImages', []);
        expect(article).toHaveProperty('createdAt');
        expect(article).toHaveProperty('updatedAt');
      });
    });
  });

  describe('Update tag name', () => {
    let TEST_TAG;
    let TEST_DELETE_TAG;

    beforeEach(async () => {
      TEST_TAG = await Tag.create({ name: `jest-test-${DateTime.local().valueOf()}` });
      TEST_DELETE_TAG = await Tag.create({
        deletedAt: new Date(),
        name: `jest-test-${DateTime.local().valueOf() + 1}`,
      });
    });

    test('Error: update tag\'s name with invalid parameters', async () => {
      const response = await request(app.callback())
        .patch('/tags/test')
        .set('Rukeith-Token', token)
        .send({ name: ' ' });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('status', HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('level', errorLevel['tagApi-1005']);
      expect(body).toHaveProperty('message', langUS['error-tagApi-1005']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Error: update tag\'s name with deleted tag id', async () => {
      const response = await request(app.callback())
        .patch(`/tags/${TEST_DELETE_TAG.id}`)
        .set('Rukeith-Token', token)
        .send({ name: 'test' });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('status', HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('level', errorLevel['tagApi-1003']);
      expect(body).toHaveProperty('message', langUS['error-tagApi-1003']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Error: update tag\'s name with not existed tag', async () => {
      const response = await request(app.callback())
        .patch('/tags/test')
        .set('Rukeith-Token', token)
        .send({ name: TEST_TAG.name });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('level', errorLevel['tagApi-1006']);
      expect(body).toHaveProperty('message', langUS['error-tagApi-1006']);
      expect(body).toHaveProperty('extra', 'Cast to ObjectId failed for value \"test\" at path \"_id\" for model \"Tag\"');
    });

    test('Success: update tag\'s name', async () => {
      const newTagName = `jest-test-new-tag-name-${DateTime.local().valueOf()}`;
      const response = await request(app.callback())
        .patch(`/tags/${TEST_TAG.id}`)
        .set('Rukeith-Token', token)
        .send({ name: newTagName });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1003']);

      const tag = await Tag.findById(TEST_TAG.id);
      expect(tag.name).toBe(newTagName);
    });
  });

  describe('Delete tag', () => {
    let TEST_TAG;
    let TEST_DELETE_TAG;

    beforeEach(async () => {
      TEST_TAG = await Tag.create({ name: `jest-test-${DateTime.local().valueOf()}` });
      TEST_DELETE_TAG = await Tag.create({
        deletedAt: new Date(),
        name: `jest-test-${DateTime.local().valueOf() + 1}`,
      });
    });

    test('Error: update tag\'s name with not existed tag', async () => {
      const response = await request(app.callback())
        .del(`/tags/${TEST_DELETE_TAG.id}`)
        .set('Rukeith-Token', token);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('status', HTTPStatus.BAD_REQUEST);
      expect(body).toHaveProperty('level', errorLevel['tagApi-1003']);
      expect(body).toHaveProperty('message', langUS['error-tagApi-1003']);
      expect(body).toHaveProperty('extra', '');
    });


    test('Error: update tag\'s name with not existed tag', async () => {
      const response = await request(app.callback())
        .del('/tags/test')
        .set('Rukeith-Token', token);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('level', errorLevel['tagApi-1007']);
      expect(body).toHaveProperty('message', langUS['error-tagApi-1007']);
      expect(body).toHaveProperty('extra', 'Cast to ObjectId failed for value \"test\" at path \"_id\" for model \"Tag\"');
    });

    test('Success: delete tag', async () => {
      const response = await request(app.callback())
        .del(`/tags/${TEST_TAG.id}`)
        .set('Rukeith-Token', token);

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.OK);
      expect(body).toHaveProperty('status', HTTPStatus.OK);
      expect(body).toHaveProperty('message', langUS['success-tagApi-1004']);
      expect(body).not.toHaveProperty('data');

      const tag = await Tag.findById(TEST_TAG.id);
      const tagJson = tag.toJSON();
      expect(tagJson).toHaveProperty('deletedAt');
    });
  });
});
