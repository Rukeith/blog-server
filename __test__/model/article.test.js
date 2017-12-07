const moment = require('moment');
const { Article } = require('../../model/schema');
const ArticleModel = require('../../model/article.js');

const articleModel = new ArticleModel();

describe('[Model] article', () => {
  describe('Create', () => {
    afterAll(async (done) => {
      await Article.remove({}); // Clear Article collection
      done();
    });

    test('Error: empty parameter', async () => {
      expect.assertions(1);
      try {
        await articleModel.create();
      } catch (error) {
        expect(error).toEqual(new Error(['article', 'model', 1000]));
      }
    });

    test('Success: create article with name', async () => {
      const options = {
        publishedAt: new Date(),
        title: 'jest-test-title',
        begins: 'jest-test-begins',
        content: 'jest-test-content',
        url: `jest-test-url-${moment().valueOf()}`,
        coverImages: [`jest-test-image-${moment().valueOf()}`],
      };
      const article = await articleModel.create(options);
      const articleJSON = article.toJSON();
      expect.assertions(11);
      expect(articleJSON).toHaveProperty('__v', 0);
      expect(articleJSON).toHaveProperty('_id');
      expect(articleJSON).toHaveProperty('title', options.title);
      expect(articleJSON).toHaveProperty('begins', options.begins);
      expect(articleJSON).toHaveProperty('content', options.content);
      expect(articleJSON).toHaveProperty('url', options.url);
      expect(articleJSON).toHaveProperty('coverImages');
      expect(articleJSON.coverImages).toEqual(expect.arrayContaining(options.coverImages));
      expect(articleJSON).toHaveProperty('publishedAt');
      expect(articleJSON).toHaveProperty('createdAt');
      expect(articleJSON).toHaveProperty('updatedAt');
    });
  });

  describe('Find, ', () => {
    let testObj;
    const options = {
      publishedAt: new Date(),
      title: 'jest-test-title',
      begins: 'jest-test-begins',
      content: 'jest-test-content',
      url: `jest-test-url-${moment().valueOf()}`,
      coverImages: [`jest-test-image-${moment().valueOf()}`],
    };

    beforeEach(async () => {
      const article = await articleModel.create(options);
      testObj = article;
    });

    afterEach(async () => {
      await Article.remove({}); // Clear Article collection
    });

    test('Error: find article with null or undefined', async () => {
      expect.assertions(1);
      try {
        await articleModel.find(null);
      } catch (error) {
        expect(error).toEqual(new Error(['article', 'model', 1001]));
      }
    });

    test('Success: Find one article', async () => {
      const article = await articleModel.find({ _id: testObj.id }, 'one');
      const articleJSON = article.toJSON();
      expect.assertions(11);
      expect(articleJSON).toHaveProperty('__v', 0);
      expect(articleJSON).toHaveProperty('_id');
      expect(articleJSON).toHaveProperty('title', options.title);
      expect(articleJSON).toHaveProperty('begins', options.begins);
      expect(articleJSON).toHaveProperty('content', options.content);
      expect(articleJSON).toHaveProperty('url', options.url);
      expect(articleJSON).toHaveProperty('coverImages');
      expect(articleJSON.coverImages).toEqual(expect.arrayContaining(options.coverImages));
      expect(articleJSON).toHaveProperty('publishedAt');
      expect(articleJSON).toHaveProperty('createdAt');
      expect(articleJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find article by id and update article name', async () => {
      const payload = {
        publishedAt: new Date(),
        title: 'jest-test-update-title',
        begins: 'jest-test-update-begins',
        content: 'jest-test-update-content',
        url: `jest-test-update-url-${moment().valueOf()}`,
        coverImages: [`jest-test-update-image-${moment().valueOf()}`],
      };
      const article = await articleModel.find(testObj.id, 'idu', { $set: payload });
      const articleJSON = article.toJSON();
      expect.assertions(11);
      expect(articleJSON).toHaveProperty('__v', 0);
      expect(articleJSON).toHaveProperty('_id');
      expect(articleJSON).toHaveProperty('title', payload.title);
      expect(articleJSON).toHaveProperty('begins', payload.begins);
      expect(articleJSON).toHaveProperty('content', payload.content);
      expect(articleJSON).toHaveProperty('url', payload.url);
      expect(articleJSON).toHaveProperty('coverImages');
      expect(articleJSON.coverImages).toEqual(expect.arrayContaining(payload.coverImages));
      expect(articleJSON).toHaveProperty('publishedAt', payload.publishedAt);
      expect(articleJSON).toHaveProperty('createdAt');
      expect(articleJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find article by id', async () => {
      const article = await articleModel.find(testObj.id, 'id');
      const articleJSON = article.toJSON();
      expect.assertions(11);
      expect(articleJSON).toHaveProperty('__v', 0);
      expect(articleJSON).toHaveProperty('_id');
      expect(articleJSON).toHaveProperty('title', options.title);
      expect(articleJSON).toHaveProperty('begins', options.begins);
      expect(articleJSON).toHaveProperty('content', options.content);
      expect(articleJSON).toHaveProperty('url', options.url);
      expect(articleJSON).toHaveProperty('coverImages');
      expect(articleJSON.coverImages).toEqual(expect.arrayContaining(options.coverImages));
      expect(articleJSON).toHaveProperty('publishedAt');
      expect(articleJSON).toHaveProperty('createdAt');
      expect(articleJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find all article', async () => {
      const articleList = await articleModel.find({}, 'all');
      expect(articleList).toHaveLength(1);
      expect.assertions(12);
      articleList.forEach((article) => {
        const articleJSON = article.toJSON();
        expect(articleJSON).toHaveProperty('__v', 0);
        expect(articleJSON).toHaveProperty('_id');
        expect(articleJSON).toHaveProperty('title', options.title);
        expect(articleJSON).toHaveProperty('begins', options.begins);
        expect(articleJSON).toHaveProperty('content', options.content);
        expect(articleJSON).toHaveProperty('url', options.url);
        expect(articleJSON).toHaveProperty('coverImages');
        expect(articleJSON.coverImages).toEqual(expect.arrayContaining(options.coverImages));
        expect(articleJSON).toHaveProperty('publishedAt');
        expect(articleJSON).toHaveProperty('createdAt');
        expect(articleJSON).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find article by default', async () => {
      const articleList = await articleModel.find();
      expect(articleList).toHaveLength(1);
      expect.assertions(12);
      articleList.forEach((article) => {
        const articleJSON = article.toJSON();
        expect(articleJSON).toHaveProperty('__v', 0);
        expect(articleJSON).toHaveProperty('_id');
        expect(articleJSON).toHaveProperty('title', options.title);
        expect(articleJSON).toHaveProperty('begins', options.begins);
        expect(articleJSON).toHaveProperty('content', options.content);
        expect(articleJSON).toHaveProperty('url', options.url);
        expect(articleJSON).toHaveProperty('coverImages');
        expect(articleJSON.coverImages).toEqual(expect.arrayContaining(options.coverImages));
        expect(articleJSON).toHaveProperty('publishedAt');
        expect(articleJSON).toHaveProperty('createdAt');
        expect(articleJSON).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find article with wrong type', async () => {
      const articleList = await articleModel.find({}, 'error');
      expect(articleList).toHaveLength(1);
      expect.assertions(12);
      articleList.forEach((article) => {
        const articleJSON = article.toJSON();
        expect(articleJSON).toHaveProperty('__v', 0);
        expect(articleJSON).toHaveProperty('_id');
        expect(articleJSON).toHaveProperty('title', options.title);
        expect(articleJSON).toHaveProperty('begins', options.begins);
        expect(articleJSON).toHaveProperty('content', options.content);
        expect(articleJSON).toHaveProperty('url', options.url);
        expect(articleJSON).toHaveProperty('coverImages');
        expect(articleJSON.coverImages).toEqual(expect.arrayContaining(options.coverImages));
        expect(articleJSON).toHaveProperty('publishedAt');
        expect(articleJSON).toHaveProperty('createdAt');
        expect(articleJSON).toHaveProperty('updatedAt');
      });
    });
  });
});
