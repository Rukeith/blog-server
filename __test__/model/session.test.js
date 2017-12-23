const { DateTime } = require('luxon');
const { Session } = require('../../model/schema');
const SessionModel = require('../../model/session.js');

const sessionModel = new SessionModel();

describe('[Model] session', () => {
  describe('Create', () => {
    afterAll(() => Session.remove({}));

    test('Error: empty parameter', async () => {
      expect.assertions(1);
      try {
        await sessionModel.create();
      } catch (error) {
        expect(error).toEqual(new Error(['session', 'model', 1000]));
      }
    });

    test('Success: create session', async () => {
      const options = {
        token: `jest-test-session-${DateTime.local().valueOf()}`,
        expiredAt: DateTime.local().plus({ minutes: 30 }).toJSDate(),
      };
      const session = await sessionModel.create(options);
      const sessionJSON = session.toJSON();
      expect.assertions(6);
      expect(sessionJSON).toHaveProperty('__v', 0);
      expect(sessionJSON).toHaveProperty('_id');
      expect(sessionJSON).toHaveProperty('token', options.token);
      expect(sessionJSON).toHaveProperty('expiredAt');
      expect(sessionJSON).toHaveProperty('createdAt');
      expect(sessionJSON).toHaveProperty('updatedAt');
    });
  });

  describe('Find, ', () => {
    let testObj;
    const options = {
      token: `jest-test-session-${DateTime.local().valueOf()}`,
      expiredAt: DateTime.local().plus({ minutes: 30 }).toJSDate(),
    };

    beforeEach(async () => {
      testObj = await sessionModel.create(options);
    });

    afterEach(() => Session.remove({}));

    test('Error: find session with null or undefined', async () => {
      expect.assertions(1);
      try {
        await sessionModel.find(null);
      } catch (error) {
        expect(error).toEqual(new Error(['session', 'model', 1001]));
      }
    });

    test('Success: Find one session', async () => {
      const session = await sessionModel.find({ _id: testObj.id }, 'one');
      const sessionJSON = session.toJSON();
      expect.assertions(6);
      expect(sessionJSON).toHaveProperty('__v', 0);
      expect(sessionJSON).toHaveProperty('_id');
      expect(sessionJSON).toHaveProperty('token', options.token);
      expect(sessionJSON).toHaveProperty('expiredAt');
      expect(sessionJSON).toHaveProperty('createdAt');
      expect(sessionJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find session by id and update session expiredAt', async () => {
      const payload = {
        expiredAt: DateTime.local().plus({ minutes: 30 }).toJSDate(),
      };
      const session = await sessionModel.find(testObj.id, 'idu', { $set: payload });
      const sessionJSON = session.toJSON();
      expect.assertions(6);
      expect(sessionJSON).toHaveProperty('__v', 0);
      expect(sessionJSON).toHaveProperty('_id');
      expect(sessionJSON).toHaveProperty('token', options.token);
      expect(sessionJSON).toHaveProperty('expiredAt');
      expect(sessionJSON).toHaveProperty('createdAt');
      expect(sessionJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find session by id', async () => {
      const session = await sessionModel.find(testObj.id, 'id');
      const sessionJSON = session.toJSON();
      expect.assertions(6);
      expect(sessionJSON).toHaveProperty('__v', 0);
      expect(sessionJSON).toHaveProperty('_id');
      expect(sessionJSON).toHaveProperty('token', options.token);
      expect(sessionJSON).toHaveProperty('expiredAt');
      expect(sessionJSON).toHaveProperty('createdAt');
      expect(sessionJSON).toHaveProperty('updatedAt');
    });

    test('Success: Find all session', async () => {
      const sessionList = await sessionModel.find({}, 'all');
      expect.assertions(7);
      expect(sessionList).toHaveLength(1);
      sessionList.forEach((session) => {
        const sessionJSON = session.toJSON();
        expect(sessionJSON).toHaveProperty('__v', 0);
        expect(sessionJSON).toHaveProperty('_id');
        expect(sessionJSON).toHaveProperty('token', options.token);
        expect(sessionJSON).toHaveProperty('expiredAt');
        expect(sessionJSON).toHaveProperty('createdAt');
        expect(sessionJSON).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find session by default', async () => {
      const sessionList = await sessionModel.find();
      expect.assertions(7);
      expect(sessionList).toHaveLength(1);
      sessionList.forEach((session) => {
        const sessionJSON = session.toJSON();
        expect(sessionJSON).toHaveProperty('__v', 0);
        expect(sessionJSON).toHaveProperty('_id');
        expect(sessionJSON).toHaveProperty('token', options.token);
        expect(sessionJSON).toHaveProperty('expiredAt');
        expect(sessionJSON).toHaveProperty('createdAt');
        expect(sessionJSON).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find session with wrong type', async () => {
      const sessionList = await sessionModel.find({}, 'error');
      expect.assertions(7);
      expect(sessionList).toHaveLength(1);
      sessionList.forEach((session) => {
        const sessionJSON = session.toJSON();
        expect(sessionJSON).toHaveProperty('__v', 0);
        expect(sessionJSON).toHaveProperty('_id');
        expect(sessionJSON).toHaveProperty('token', options.token);
        expect(sessionJSON).toHaveProperty('expiredAt');
        expect(sessionJSON).toHaveProperty('createdAt');
        expect(sessionJSON).toHaveProperty('updatedAt');
      });
    });
  });
});
