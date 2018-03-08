const CommonModel = require('../../model/common.js');

describe('[Model] common', () => {
  describe('Create', () => {
    test('Error: empty parameter', () => {
      expect.assertions(1);
      try {
        const commonModel = new CommonModel();
        expect(commonModel).toEqual('');
      } catch (error) {
        expect(error).toEqual(new Error(['common', 'model', 1000]));
      }
    });
  });
});
