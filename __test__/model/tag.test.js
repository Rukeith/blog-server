const moment = require('moment');
const TagModel = require('../../model/tag');

const tagModel = new TagModel();

describe('[Model] tag', () => {
  // test('Error: empty parameter', async () => {
  //   expect.assertions(1);
  //   await expect(tagModel.create()).rejects.toMatchObject({
  //     message: 'tag'
  //   });
  // });

  test('Success: create tag with name', async () => {
    const tagName = `jest-test-${moment().valueOf()}`;
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
