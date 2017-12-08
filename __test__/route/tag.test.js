const request = require('supertest');
const { Tag } = require('../../model/schema');
const app = require('../../index.js');

describe('[Route] tag', () => {
  describe('Create tag', () => {
    afterEach(() => {
      Tag.remove({});
      app.close();
    });

    test('Error: name is empty', async () => {
      const names = [' '];
      try {
        const response = await request(app)
          .post('/tags').send({ names });
        console.log('response =', response);
      } catch (error) {
        console.log('error =', error);
      }
    });
  });
});
