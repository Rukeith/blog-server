const jwt = require('jsonwebtoken');
const request = require('supertest');
const CryptoJS = require('crypto-js');
const HTTPStatus = require('http-status');
const app = require('../../index.js');
const langUS = require('../../locales/us.json');
const errorLevel = require('../../config/error.json');
const { Session } = require('../../model/schema');

describe('[Route] index', () => {
  beforeAll(() => {
    process.env.USERNAME = 'jest-test';
    process.env.PASSWORD = `${Math.random()}`;
    process.env.SALT = CryptoJS.MD5(process.env.USERNAME);
    process.env.HASH_PASSWORD = CryptoJS.HmacSHA512(`${process.env.PASSWORD}${process.env.SALT}`, process.env.SALT);
  });

  afterEach(() => Session.remove({}));

  describe('Login', () => {
    test('Error: username is not existed', async () => {
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

    test('Error: password is mismatch', async () => {
      const response = await request(app.callback())
        .post('/login')
        .send({
          username: process.env.USERNAME,
          password: 'testtest',
        });

      const { body, status } = response;
      expect(status).toBe(HTTPStatus.UNAUTHORIZED);
      expect(body).toHaveProperty('status', HTTPStatus.UNAUTHORIZED);
      expect(body).toHaveProperty('level', errorLevel['indexApi-1001']);
      expect(body).toHaveProperty('message', langUS['error-indexApi-1001']);
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
