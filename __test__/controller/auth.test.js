const { verifyPassword, verifyToken } = require('../../controller/auth.js');

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
  });

  describe('verifyToken', () => {
    it('Token is empty', () => {
      expect(verifyToken()).toHaveProperty('valid', false);
    });
  });
});
