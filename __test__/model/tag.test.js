const { DateTime } = require('luxon');
const { Tag } = require('../../model/schema');
const TagModel = require('../../model/tag');

const tagModel = new TagModel();

describe('[Model] tag, ', () => {
  describe('Create, ', () => {
    afterAll(() => Tag.remove({}));

    test('Error: empty parameter', async () => {
      expect.assertions(1);
      try {
        await tagModel.create();
      } catch (error) {
        expect(error).toEqual(new Error(['tag', 'model', 1000]));
      }
    });

    test('Success: create tag with name', async () => {
      const tagName = `jest-test-${DateTime.local().valueOf()}`;
      const tag = await tagModel.create(tagName);
      const tagJSON = tag.toJSON();
      expect.assertions(6);
      expect(tagJSON).toHaveProperty('__v', 0);
      expect(tagJSON).toHaveProperty('_id');
      expect(tagJSON).toHaveProperty('name', tagName);
      expect(tagJSON).toHaveProperty('articles', []);
      expect(tagJSON).toHaveProperty('createdAt');
      expect(tagJSON).toHaveProperty('updatedAt');
    });
  });

  describe('Find, ', () => {
    let testObj;
    const tagName = `jest-test-${DateTime.local().valueOf()}`;

    beforeEach(async () => {
      testObj = await tagModel.create(tagName);
    });

    afterEach(() => Tag.remove({}));

    test('Error: find tag with null or undefined', async () => {
      expect.assertions(1);
      try {
        await tagModel.find(null);
      } catch (error) {
        expect(error).toEqual(new Error(['tag', 'model', 1001]));
      }
    });

    test('Success: Find one tag', async () => {
      const tag = await tagModel.find({ _id: testObj.id }, 'one');
      const tagJSON = tag.toJSON();
      expect.assertions(6);
      expect(tagJSON).toHaveProperty('__v', 0);
      expect(tagJSON).toHaveProperty('_id');
      expect(tagJSON).toHaveProperty('name', tagName);
      expect(tagJSON).toHaveProperty('articles', []);
      expect(tagJSON).toHaveProperty('createdAt');
      expect(tagJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find tag by id and update tag name', async () => {
      const newName = `jest-test-update-${DateTime.local().valueOf()}`;
      const tag = await tagModel.find(testObj.id, 'idu', { $set: { name: newName } });
      const tagJSON = tag.toJSON();
      expect.assertions(6);
      expect(tagJSON).toHaveProperty('__v', 0);
      expect(tagJSON).toHaveProperty('_id');
      expect(tagJSON).toHaveProperty('name', newName);
      expect(tagJSON).toHaveProperty('articles', []);
      expect(tagJSON).toHaveProperty('createdAt');
      expect(tagJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find tag by id', async () => {
      const tag = await tagModel.find(testObj.id, 'id');
      const tagJSON = tag.toJSON();
      expect.assertions(6);
      expect(tagJSON).toHaveProperty('__v', 0);
      expect(tagJSON).toHaveProperty('_id');
      expect(tagJSON).toHaveProperty('name', tagName);
      expect(tagJSON).toHaveProperty('articles', []);
      expect(tagJSON).toHaveProperty('createdAt');
      expect(tagJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find all tag', async () => {
      const tagList = await tagModel.find({}, 'all');
      expect(tagList).toHaveLength(1);
      expect.assertions(7);
      tagList.forEach((tag) => {
        const tagJSON = tag.toJSON();
        expect(tagJSON).toHaveProperty('__v', 0);
        expect(tagJSON).toHaveProperty('_id');
        expect(tagJSON).toHaveProperty('name', tagName);
        expect(tagJSON).toHaveProperty('articles', []);
        expect(tagJSON).toHaveProperty('createdAt');
        expect(tagJSON).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find tag by default', async () => {
      const tagList = await tagModel.find();
      expect.assertions(7);
      expect(tagList).toHaveLength(1);
      tagList.forEach((tag) => {
        const tagJSON = tag.toJSON();
        expect(tagJSON).toHaveProperty('__v', 0);
        expect(tagJSON).toHaveProperty('_id');
        expect(tagJSON).toHaveProperty('name', tagName);
        expect(tagJSON).toHaveProperty('articles', []);
        expect(tagJSON).toHaveProperty('createdAt');
        expect(tagJSON).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find tag with wrong type', async () => {
      const tagList = await tagModel.find({}, 'error');
      expect.assertions(7);
      expect(tagList).toHaveLength(1);
      tagList.forEach((tag) => {
        const tagJSON = tag.toJSON();
        expect(tagJSON).toHaveProperty('__v', 0);
        expect(tagJSON).toHaveProperty('_id');
        expect(tagJSON).toHaveProperty('name', tagName);
        expect(tagJSON).toHaveProperty('articles', []);
        expect(tagJSON).toHaveProperty('createdAt');
        expect(tagJSON).toHaveProperty('updatedAt');
      });
    });
  });
});
