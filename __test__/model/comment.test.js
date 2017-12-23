const { DateTime } = require('luxon');
const { Article, Comment } = require('../../model/schema');
const CommentModel = require('../../model/comment.js');

const commentModel = new CommentModel();

describe('[Model] comment', () => {
  describe('Create', () => {
    let TEST_ARTICLE;

    beforeAll(async () => {
      const options = {
        publishedAt: new Date(),
        title: 'jest-test-title',
        begins: 'jest-test-begins',
        content: 'jest-test-content',
        url: `jest-test-url-${DateTime.local().valueOf()}`,
        coverImages: [`jest-test-image-${DateTime.local().valueOf()}`],
      };
      TEST_ARTICLE = await Article.create(options);
    });

    afterAll(() => Promise.all([Article.remove({}), Comment.remove({})]));

    test('Error: empty parameter', async () => {
      expect.assertions(1);
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
      const commentJSON = comment.toJSON();
      expect.assertions(7);
      expect(commentJSON).toHaveProperty('__v', 0);
      expect(commentJSON).toHaveProperty('_id');
      expect(commentJSON).toHaveProperty('article_id', options.article_id);
      expect(commentJSON).toHaveProperty('username', options.username);
      expect(commentJSON).toHaveProperty('context', options.context);
      expect(commentJSON).toHaveProperty('createdAt');
      expect(commentJSON).toHaveProperty('updatedAt');
    });
  });

  describe('Find, ', () => {
    let testObj;
    const options = {
      article: {
        publishedAt: new Date(),
        title: 'jest-test-title',
        begins: 'jest-test-begins',
        content: 'jest-test-content',
        url: `jest-test-url-${DateTime.local().valueOf()}`,
        coverImages: [`jest-test-image-${DateTime.local().valueOf()}`],
      },
      comment: {
        username: `jest-test-username-${DateTime.local().valueOf()}`,
        context: 'test',
      },
    };

    beforeEach(async () => {
      const article = await Article.create(options.article);
      options.comment.article_id = article._id;
      testObj = await commentModel.create(options.comment);
    });

    afterEach(() => Promise.all([Article.remove({}), Comment.remove({})]));

    test('Error: find comment with null or undefined', async () => {
      expect.assertions(1);
      try {
        await commentModel.find(null);
      } catch (error) {
        expect(error).toEqual(new Error(['comment', 'model', 1001]));
      }
    });

    test('Success: Find one comment', async () => {
      const comment = await commentModel.find({ _id: testObj.id }, 'one');
      const commentJSON = comment.toJSON();
      expect.assertions(7);
      expect(commentJSON).toHaveProperty('__v', 0);
      expect(commentJSON).toHaveProperty('_id');
      expect(commentJSON).toHaveProperty('article_id', options.comment.article_id);
      expect(commentJSON).toHaveProperty('username', options.comment.username);
      expect(commentJSON).toHaveProperty('context', options.comment.context);
      expect(commentJSON).toHaveProperty('createdAt');
      expect(commentJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find comment by id and update comment name', async () => {
      const payload = {
        comment: 'jest-test-update-comment',
      };
      const comment = await commentModel.find(testObj.id, 'idu', { $set: payload });
      const commentJSON = comment.toJSON();
      expect.assertions(7);
      expect(commentJSON).toHaveProperty('__v', 0);
      expect(commentJSON).toHaveProperty('_id');
      expect(commentJSON).toHaveProperty('article_id', options.comment.article_id);
      expect(commentJSON).toHaveProperty('username', options.comment.username);
      expect(commentJSON).toHaveProperty('context', options.comment.context);
      expect(commentJSON).toHaveProperty('createdAt');
      expect(commentJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find comment by id', async () => {
      const comment = await commentModel.find(testObj.id, 'id');
      const commentJSON = comment.toJSON();
      expect.assertions(7);
      expect(commentJSON).toHaveProperty('__v', 0);
      expect(commentJSON).toHaveProperty('_id');
      expect(commentJSON).toHaveProperty('article_id', options.comment.article_id);
      expect(commentJSON).toHaveProperty('username', options.comment.username);
      expect(commentJSON).toHaveProperty('context', options.comment.context);
      expect(commentJSON).toHaveProperty('createdAt');
      expect(commentJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find all comment', async () => {
      const commentList = await commentModel.find({}, 'all');
      expect.assertions(8);
      expect(commentList).toHaveLength(1);
      commentList.forEach((comment) => {
        const commentJSON = comment.toJSON();
        expect(commentJSON).toHaveProperty('__v', 0);
        expect(commentJSON).toHaveProperty('_id');
        expect(commentJSON).toHaveProperty('article_id', options.comment.article_id);
        expect(commentJSON).toHaveProperty('username', options.comment.username);
        expect(commentJSON).toHaveProperty('context', options.comment.context);
        expect(commentJSON).toHaveProperty('createdAt');
        expect(commentJSON).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find comment by default', async () => {
      const commentList = await commentModel.find();
      expect.assertions(8);
      expect(commentList).toHaveLength(1);
      commentList.forEach((comment) => {
        const commentJSON = comment.toJSON();
        expect(commentJSON).toHaveProperty('__v', 0);
        expect(commentJSON).toHaveProperty('_id');
        expect(commentJSON).toHaveProperty('article_id', options.comment.article_id);
        expect(commentJSON).toHaveProperty('username', options.comment.username);
        expect(commentJSON).toHaveProperty('context', options.comment.context);
        expect(commentJSON).toHaveProperty('createdAt');
        expect(commentJSON).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find comment with wrong type', async () => {
      const commentList = await commentModel.find({}, 'error');
      expect.assertions(8);
      expect(commentList).toHaveLength(1);
      commentList.forEach((comment) => {
        const commentJSON = comment.toJSON();
        expect(commentJSON).toHaveProperty('__v', 0);
        expect(commentJSON).toHaveProperty('_id');
        expect(commentJSON).toHaveProperty('article_id', options.comment.article_id);
        expect(commentJSON).toHaveProperty('username', options.comment.username);
        expect(commentJSON).toHaveProperty('context', options.comment.context);
        expect(commentJSON).toHaveProperty('createdAt');
        expect(commentJSON).toHaveProperty('updatedAt');
      });
    });
  });
});
