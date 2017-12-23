const jwt = require('jsonwebtoken');
const request = require('supertest');
const HTTPStatus = require('http-status');
const app = require('../../index.js');
const langUS = require('../../locales/us.json');
const errorLevel = require('../../config/error.json');
const { Session } = require('../../model/schema');

describe('[Route] index', () => {
  afterEach(() => Session.remove({}));

  describe('Login', () => {
    test('Error: username and password is mismatch', async () => {
      const response = await request(app.callback())
        .post('/login')
        .send({
          username: 'test',
          password: 'testtest',
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.UNAUTHORIZED);
      expect(body).toHaveProperty('status', HTTPStatus.UNAUTHORIZED);
      expect(body).toHaveProperty('level', errorLevel['indexApi-1000']);
      expect(body).toHaveProperty('message', langUS['error-indexApi-1000']);
      expect(body).toHaveProperty('extra', '');
    });

    test('Success: login and create session', async () => {
      const response = await request(app.callback())
        .post('/login')
        .send({
          username: process.env.USERNAME,
          password: process.env.PASSWORD,
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.ACCEPTED);
      expect(body).toHaveProperty('status', HTTPStatus.ACCEPTED);
      expect(body).toHaveProperty('message', langUS['success-indexApi-1000']);
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('token');
      const result = jwt.verify(body.data.token, Buffer.from(process.env.JWT_SECRET));
      expect(result).toHaveProperty('ip');
      expect(result).toHaveProperty('iss', 'rukeith');
    });
  });
});
