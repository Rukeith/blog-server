const _ = require('lodash');
const jwt = require('jsonwebtoken');
const HmacSHA512 = require('crypto-js/hmac-sha512');

module.exports = {
  verifyPassword: (password, salt) => {
    if (_.isEmpty(password) || _.isEmpty(salt)) {
      throw new Error(['auth', 'controller', 1000]);
    }

    const validPassword = _.toString(HmacSHA512(process.env.PASSWORD, salt));
    return validPassword === password;
  },

  verifyToken: (token) => {
    if (_.isNil(token)) return { valid: false };
    return { valid: true, data: jwt.verify(token, Buffer.from(process.env.JWT_SECRET)) };
  },
};
