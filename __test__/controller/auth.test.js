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

    it('Password valid', () => {
      process.env.PASSWORD = `${Math.random()}`;
      process.env.SALT = `${Math.random()}`;
      process.env.HASH_PASSWORD = _.toString(HmacSHA512(`${process.env.PASSWORD}${process.env.SALT}`, process.env.SALT));
      expect(verifyPassword(process.env.PASSWORD)).toBe(true);
    });
  });

  describe('encryptPassword', () => {
    it('encryptPassword', () => {
      const salt = `${Math.random()}`;
      const password = `${Math.random()}`;
      expect(encryptPassword(password, salt)).toBe(_.toString(HmacSHA512(password, salt)));
    });
  });

  describe('verifyToken', () => {
    it('Token is empty', () => {
      expect(verifyToken()).toHaveProperty('valid', false);
    });
  });
});
