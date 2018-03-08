const request = require('supertest');
const HTTPStatus = require('http-status');
const app = require('../../index.js');
const langUS = require('../../locales/us.json');
const errorLevel = require('../../config/error.json');

describe('[Middleware] data', () => {
  describe('validateParameters', () => {
    test('Error: parameters is invalid', async () => {
      const response = await request(app.callback())
        .post('/login')
        .send({ password: '123456' });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('status', HTTPStatus.INTERNAL_SERVER_ERROR);
      expect(body).toHaveProperty('level', errorLevel['dataMiddleware-1001']);
      expect(body).toHaveProperty('message', langUS['error-dataMiddleware-1001']);
      expect(body).toHaveProperty('extra', JSON.stringify([
        {
          message: 'required',
          field: 'username',
          code: 'missing_field',
        },
        {
          message: 'length should bigger than 8',
          code: 'invalid',
          field: 'password',
        },
      ]));
    });
  });
});
