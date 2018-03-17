const _ = require('lodash');
const jwt = require('jsonwebtoken');
const HmacSHA512 = require('crypto-js/hmac-sha512');

const encryptPassword = (password, salt) => _.toString(HmacSHA512(password, salt));

module.exports = {
  encryptPassword,

  verifyPassword(password) {
    if (_.isEmpty(password)) {
      throw new Error(['auth', 'controller', 1000]);
    }

    return (encryptPassword(`${password}${process.env.SALT}`, process.env.SALT) === process.env.HASH_PASSWORD);
  },

  verifyToken(token) {
    if (_.isNil(token)) return { valid: false };
    try {
      return {
        valid: true,
        data: jwt.verify(token, Buffer.from(process.env.JWT_SECRET)),
      };
    } catch (error) {
      return {
        valid: false,
        data: error,
      };
    }
  },
};
