const _ = require('lodash');
const HmacSHA512 = require('crypto-js/hmac-sha512');
const { verifyPassword, encryptPassword, verifyToken } = require('../../controller/auth.js');

describe('[Controller] auth', () => {
  describe('verifyPassword', () => {
    it('password is empty', () => {
      expect(() => {
        verifyPassword();
      }).toThrowError('auth,controller,1000');
    });

    it('salt is empty', () => {
      expect(() => {
        verifyPassword('test');
      }).toThrowError('auth,controller,1000');
    });

    it('Password valid', () => {
      process.env.PASSWORD = `${Math.random()}`;
      const salt = `${Math.random()}`;
      const encrypt = _.toString(HmacSHA512(process.env.PASSWORD, salt));
      expect(verifyPassword(encrypt, salt)).toBe(true);
    });
  });

  describe('encryptPassword', () => {
    it('encryptPassword', () => {
      const password = `${Math.random()}`;
      const salt = `${Math.random()}`;
      expect(encryptPassword(password, salt)).toBe(_.toString(HmacSHA512(password, salt)));
    });
  });

  describe('verifyToken', () => {
    it('Token is empty', () => {
      expect(verifyToken()).toHaveProperty('valid', false);
    });
  });
});
