const { DateTime } = require('luxon');
const { Article, Comment } = require('../../model/schema');
const CommentModel = require('../../model/comment.js');

const commentModel = new CommentModel();

describe('[Model] comment', () => {
  describe('Create', () => {
    let TEST_ARTICLE;

    beforeAll(async () => {
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
      TEST_ARTICLE = await Article.create(options);
    });

    afterAll(() => Promise.all([Article.deleteMany({}), Comment.deleteMany({})]));

    test('Error: empty parameter', async () => {
      try {
        await commentModel.create();
      } catch (error) {
        expect(error).toEqual(new Error(['comment', 'model', 1000]));
      }
    });

    test('Success: create comment', async () => {
      const options = {
        article_id: TEST_ARTICLE._id,
        username: `jest-test-username-${DateTime.local().valueOf()}`,
        context: 'test',
      };
      const comment = await commentModel.create(options);
      expect(comment).toHaveProperty('__v', 0);
      expect(comment).toHaveProperty('_id');
      expect(comment).toHaveProperty('article_id', options.article_id);
      expect(comment).toHaveProperty('username', options.username);
      expect(comment).toHaveProperty('context', options.context);
      expect(comment).toHaveProperty('createdAt');
      expect(comment).toHaveProperty('updatedAt');
    });
  });

  describe('Find, ', () => {
    let testObj;
    const demoTime = DateTime.local().valueOf();
    const options = {
      article: {
        publishedAt: new Date(),
        title: 'jest-test-title',
        begins: 'jest-test-begins',
        content: 'jest-test-content',
        url: `jest-test-url-${demoTime}`,
        category: `jest-test-category-${demoTime}`,
        coverImages: [`jest-test-image-${demoTime}`],
      },
      comment: {
        username: `jest-test-username-${demoTime}`,
        context: 'test',
      },
    };

    beforeEach(async () => {
      const article = await Article.create(options.article);
      options.comment.article_id = article._id;
      testObj = await commentModel.create(options.comment);
    });

    afterEach(() => Promise.all([Article.deleteMany({}), Comment.deleteMany({})]));

    test('Error: find comment with null or undefined', async () => {
      try {
        await commentModel.find(null);
      } catch (error) {
        expect(error).toEqual(new Error(['comment', 'model', 1001]));
      }
    });

    test('Success: Find one comment', async () => {
      const comment = await commentModel.find({ _id: testObj.id }, 'one');
      expect(comment).toHaveProperty('__v', 0);
      expect(comment).toHaveProperty('_id');
      expect(comment).toHaveProperty('article_id', options.comment.article_id);
      expect(comment).toHaveProperty('username', options.comment.username);
      expect(comment).toHaveProperty('context', options.comment.context);
      expect(comment).toHaveProperty('createdAt');
      expect(comment).toHaveProperty('updatedAt');
    });

    test('Success: Find comment by id and update comment name', async () => {
      const payload = {
        comment: 'jest-test-update-comment',
      };
      const comment = await commentModel.find(testObj.id, 'idu', { $set: payload });
      expect(comment).toHaveProperty('__v', 0);
      expect(comment).toHaveProperty('_id');
      expect(comment).toHaveProperty('article_id', options.comment.article_id);
      expect(comment).toHaveProperty('username', options.comment.username);
      expect(comment).toHaveProperty('context', options.comment.context);
      expect(comment).toHaveProperty('createdAt');
      expect(comment).toHaveProperty('updatedAt');
    });

    test('Success: Find comment by id', async () => {
      const comment = await commentModel.find(testObj.id, 'id');
      expect(comment).toHaveProperty('__v', 0);
      expect(comment).toHaveProperty('_id');
      expect(comment).toHaveProperty('article_id', options.comment.article_id);
      expect(comment).toHaveProperty('username', options.comment.username);
      expect(comment).toHaveProperty('context', options.comment.context);
      expect(comment).toHaveProperty('createdAt');
      expect(comment).toHaveProperty('updatedAt');
    });

    test('Success: Find all comment', async () => {
      const commentList = await commentModel.find({}, 'all');
      expect(commentList).toHaveLength(1);
      commentList.forEach((comment) => {
        expect(comment).toHaveProperty('__v', 0);
        expect(comment).toHaveProperty('_id');
        expect(comment).toHaveProperty('article_id', options.comment.article_id);
        expect(comment).toHaveProperty('username', options.comment.username);
        expect(comment).toHaveProperty('context', options.comment.context);
        expect(comment).toHaveProperty('createdAt');
        expect(comment).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find comment by default', async () => {
      const commentList = await commentModel.find();
      expect(commentList).toHaveLength(1);
      commentList.forEach((comment) => {
        expect(comment).toHaveProperty('__v', 0);
        expect(comment).toHaveProperty('_id');
        expect(comment).toHaveProperty('article_id', options.comment.article_id);
        expect(comment).toHaveProperty('username', options.comment.username);
        expect(comment).toHaveProperty('context', options.comment.context);
        expect(comment).toHaveProperty('createdAt');
        expect(comment).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find comment with wrong type', async () => {
      const commentList = await commentModel.find({}, 'error');
      expect(commentList).toHaveLength(1);
      commentList.forEach((comment) => {
        expect(comment).toHaveProperty('__v', 0);
        expect(comment).toHaveProperty('_id');
        expect(comment).toHaveProperty('article_id', options.comment.article_id);
        expect(comment).toHaveProperty('username', options.comment.username);
        expect(comment).toHaveProperty('context', options.comment.context);
        expect(comment).toHaveProperty('createdAt');
        expect(comment).toHaveProperty('updatedAt');
      });
    });
  });
});
