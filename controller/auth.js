const _ = require('lodash');
const jwt = require('jsonwebtoken');
const HmacSHA512 = require('crypto-js/hmac-sha512');

const encryptPassword = (password, salt) => _.toString(HmacSHA512(password, salt));

module.exports = {
  encryptPassword,

  verifyPassword: (password, salt) => {
    if (_.isEmpty(password) || _.isEmpty(salt)) {
      throw new Error(['auth', 'controller', 1000]);
    }

    return (encryptPassword(process.env.PASSWORD, salt) === password);
  },

  verifyToken: (token) => {
    if (_.isNil(token)) return { valid: false };
    return {
      valid: true,
      data: jwt.verify(token, Buffer.from(process.env.JWT_SECRET)),
    };
  },
};
