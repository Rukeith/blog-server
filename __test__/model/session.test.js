const { DateTime } = require('luxon');
const { Session } = require('../../model/schema');
const SessionModel = require('../../model/session.js');

const sessionModel = new SessionModel();

describe('[Model] session', () => {
  describe('Create', () => {
    afterAll(() => Session.deleteMany({}));

    test('Error: empty parameter', async () => {
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
      expect(session).toHaveProperty('__v', 0);
      expect(session).toHaveProperty('_id');
      expect(session).toHaveProperty('token', options.token);
      expect(session).toHaveProperty('expiredAt');
      expect(session).toHaveProperty('createdAt');
      expect(session).toHaveProperty('updatedAt');
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

    afterEach(() => Session.deleteMany({}));

    test('Error: find session with null or undefined', async () => {
      try {
        await sessionModel.find(null);
      } catch (error) {
        expect(error).toEqual(new Error(['session', 'model', 1001]));
      }
    });

    test('Success: Find one session', async () => {
      const session = await sessionModel.find({ _id: testObj.id }, 'one');
      expect(session).toHaveProperty('__v', 0);
      expect(session).toHaveProperty('_id');
      expect(session).toHaveProperty('token', options.token);
      expect(session).toHaveProperty('expiredAt');
      expect(session).toHaveProperty('createdAt');
      expect(session).toHaveProperty('updatedAt');
    });

    test('Success: Find session by id and update session expiredAt', async () => {
      const payload = {
        expiredAt: DateTime.local().plus({ minutes: 30 }).toJSDate(),
      };
      const session = await sessionModel.find(testObj.id, 'idu', { $set: payload });
      expect(session).toHaveProperty('__v', 0);
      expect(session).toHaveProperty('_id');
      expect(session).toHaveProperty('token', options.token);
      expect(session).toHaveProperty('expiredAt');
      expect(session).toHaveProperty('createdAt');
      expect(session).toHaveProperty('updatedAt');
    });

    test('Success: Find session by id', async () => {
      const session = await sessionModel.find(testObj.id, 'id');
      expect(session).toHaveProperty('__v', 0);
      expect(session).toHaveProperty('_id');
      expect(session).toHaveProperty('token', options.token);
      expect(session).toHaveProperty('expiredAt');
      expect(session).toHaveProperty('createdAt');
      expect(session).toHaveProperty('updatedAt');
    });

    test('Success: Find all session', async () => {
      const sessionList = await sessionModel.find({}, 'all');
      expect(sessionList).toHaveLength(1);
      sessionList.forEach((session) => {
        expect(session).toHaveProperty('__v', 0);
        expect(session).toHaveProperty('_id');
        expect(session).toHaveProperty('token', options.token);
        expect(session).toHaveProperty('expiredAt');
        expect(session).toHaveProperty('createdAt');
        expect(session).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find session by default', async () => {
      const sessionList = await sessionModel.find();
      expect(sessionList).toHaveLength(1);
      sessionList.forEach((session) => {
        expect(session).toHaveProperty('__v', 0);
        expect(session).toHaveProperty('_id');
        expect(session).toHaveProperty('token', options.token);
        expect(session).toHaveProperty('expiredAt');
        expect(session).toHaveProperty('createdAt');
        expect(session).toHaveProperty('updatedAt');
      });
    });

    test('Success: Find session with wrong type', async () => {
      const sessionList = await sessionModel.find({}, 'error');
      expect(sessionList).toHaveLength(1);
      sessionList.forEach((session) => {
        expect(session).toHaveProperty('__v', 0);
        expect(session).toHaveProperty('_id');
        expect(session).toHaveProperty('token', options.token);
        expect(session).toHaveProperty('expiredAt');
        expect(session).toHaveProperty('createdAt');
        expect(session).toHaveProperty('updatedAt');
      });
    });
  });
});
