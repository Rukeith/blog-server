const { DateTime } = require('luxon');
const { Article } = require('../../model/schema');
const ArticleModel = require('../../model/article.js');

const articleModel = new ArticleModel();

describe('[Model] article', () => {
  describe('Create', () => {
    afterAll(() => Article.deleteMany({}));

    test('Error: empty parameter', async () => {
      try {
        await articleModel.create();
      } catch (error) {
        expect(error).toEqual(new Error(['article', 'model', 1000]));
      }
    });

    test('Success: create article with name', async () => {
      const time = DateTime.local().valueOf();
      const options = {
        publishedAt: new Date(),
        title: 'jest-test-title',
        begins: 'jest-test-begins',
        content: 'jest-test-content',
        url: `jest-test-url-${time}`,
        category: `jest-test-category-${time}`,
        coverImages: [`jest-test-image-${time}`],
      };
      const article = await articleModel.create(options);
      expect(article).toHaveProperty('__v', 0);
      expect(article).toHaveProperty('_id');
      expect(article).toHaveProperty('title', options.title);
      expect(article).toHaveProperty('begins', options.begins);
      expect(article).toHaveProperty('content', options.content);
      expect(article).toHaveProperty('url', options.url);
      expect(article).toHaveProperty('category', options.category);
      expect(article).toHaveProperty('coverImages');
      expect(article.coverImages).toEqual(expect.arrayContaining(options.coverImages));
      expect(article).toHaveProperty('publishedAt');
      expect(article).toHaveProperty('createdAt');
      expect(article).toHaveProperty('updatedAt');
    });
  });

  describe('Find, ', () => {
    let testObj;
    const demoTime = DateTime.local().valueOf();
    const options = {
      publishedAt: new Date(),
      title: 'jest-test-title',
      begins: 'jest-test-begins',
      content: 'jest-test-content',
      url: `jest-test-url-${demoTime}`,
      category: `jest-test-category-${demoTime}`,
      coverImages: [`jest-test-image-${demoTime}`],
    };

    beforeEach(async () => {
      testObj = await articleModel.create(options);
    });

    afterEach(() => Article.deleteMany({}));

    test('Error: find article with null or undefined', async () => {
      try {
        await articleModel.find(null);
      } catch (error) {
        expect(error).toEqual(new Error(['article', 'model', 1001]));
      }
    });

    test('Success: Find one article', async () => {
      const article = await articleModel.find({ _id: testObj.id }, 'one');
      expect(article).toHaveProperty('__v', 0);
      expect(article).toHaveProperty('_id');
      expect(article).toHaveProperty('title', options.title);
      expect(article).toHaveProperty('begins', options.begins);
      expect(article).toHaveProperty('content', options.content);
      expect(article).toHaveProperty('url', options.url);
      expect(article).toHaveProperty('category', options.category);
      expect(article).toHaveProperty('coverImages');
      expect(article.coverImages).toEqual(expect.arrayContaining(options.coverImages));
      expect(article).toHaveProperty('publishedAt');
      expect(article).toHaveProperty('createdAt');
      expect(article).toHaveProperty('updatedAt');
    });

    test('Success: Find article by id and update article name', async () => {
      const time = DateTime.local().valueOf();
      const payload = {
        publishedAt: new Date(),
        title: 'jest-test-update-title',
        begins: 'jest-test-update-begins',
        content: 'jest-test-update-content',
        url: `jest-test-update-url-${time}`,
        category: `jest-test-category-${time}`,
        coverImages: [`jest-test-update-image-${time}`],
      };
      const article = await articleModel.find(testObj.id, 'idu', { $set: payload });
      expect(article).toHaveProperty('__v', 0);
      expect(article).toHaveProperty('_id');
      expect(article).toHaveProperty('title', payload.title);
      expect(article).toHaveProperty('begins', payload.begins);
      expect(article).toHaveProperty('content', payload.content);
      expect(article).toHaveProperty('url', payload.url);
      expect(article).toHaveProperty('category', payload.category);
      expect(article).toHaveProperty('coverImages');
      expect(article.coverImages).toEqual(expect.arrayContaining(payload.coverImages));
      expect(article).toHaveProperty('publishedAt', payload.publishedAt);
      expect(article).toHaveProperty('createdAt');
      expect(article).toHaveProperty('updatedAt');
    });

    test('Success: Find article by id', async () => {
      const article = await articleModel.find(testObj.id, 'id');
      expect(article).toHaveProperty('__v', 0);
      expect(article).toHaveProperty('_id');
      expect(article).toHaveProperty('title', options.title);
      expect(article).toHaveProperty('begins', options.begins);
      expect(article).toHaveProperty('content', options.content);
      expect(article).toHaveProperty('url', options.url);
      expect(article).toHaveProperty('category', options.category);
      expect(article).toHaveProperty('coverImages');
      expect(article.coverImages).toEqual(expect.arrayContaining(options.coverImages));
      expect(article).toHaveProperty('publishedAt');
      expect(article).toHaveProperty('createdAt');
      expect(article).toHaveProperty('updatedAt');
    });

    test('Success: Find all article', async () => {
      const articleList = await articleModel.find({}, 'all');
      expect(articleList).toHaveLength(1);
      articleList.forEach((article) => {
        expect(article).toHaveProperty('__v', 0);
        expect(article).toHaveProperty('_id');
        expect(article).toHaveProperty('title', options.title);
        expect(article).toHaveProperty('begins', options.begins);
        expect(article).toHaveProperty('content', options.content);
        expect(article).toHaveProperty('url', options.url);
        expect(article).toHaveProperty('category', options.category);
        expect(article).toHaveProperty('coverImages');
        expect(article.coverImages).toEqual(expect.arrayContaining(options.coverImages));
        expect(article).toHaveProperty('publishedAt');
        expect(article).toHaveProperty('createdAt');
        expect(article).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find article by default', async () => {
      const articleList = await articleModel.find();
      expect(articleList).toHaveLength(1);
      articleList.forEach((article) => {
        expect(article).toHaveProperty('__v', 0);
        expect(article).toHaveProperty('_id');
        expect(article).toHaveProperty('title', options.title);
        expect(article).toHaveProperty('begins', options.begins);
        expect(article).toHaveProperty('content', options.content);
        expect(article).toHaveProperty('url', options.url);
        expect(article).toHaveProperty('category', options.category);
        expect(article).toHaveProperty('coverImages');
        expect(article.coverImages).toEqual(expect.arrayContaining(options.coverImages));
        expect(article).toHaveProperty('publishedAt');
        expect(article).toHaveProperty('createdAt');
        expect(article).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find article with wrong type', async () => {
      const articleList = await articleModel.find({}, 'error');
      expect(articleList).toHaveLength(1);
      articleList.forEach((article) => {
        expect(article).toHaveProperty('__v', 0);
        expect(article).toHaveProperty('_id');
        expect(article).toHaveProperty('title', options.title);
        expect(article).toHaveProperty('begins', options.begins);
        expect(article).toHaveProperty('content', options.content);
        expect(article).toHaveProperty('url', options.url);
        expect(article).toHaveProperty('category', options.category);
        expect(article).toHaveProperty('coverImages');
        expect(article.coverImages).toEqual(expect.arrayContaining(options.coverImages));
        expect(article).toHaveProperty('publishedAt');
        expect(article).toHaveProperty('createdAt');
        expect(article).toHaveProperty('updatedAt');
      });
    });
  });
});
