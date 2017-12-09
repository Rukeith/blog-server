const HTTPStatus = require('http-status');

const { validateParameters } = require('../../middleware/data.js');

describe.skip('[Middleware]', () => {
  test('post/articles', async () => {
    const ctx = {
      begins: 'Begins',
      content: 'Content',
      url: 'title-artilce',
      tags: ['tag1'],
      coverImages: ['https://rukeith.com'],
    };

    await validateParameters('post/articles')(ctx, () => {});
    expect(ctx).toHaveProperty('sentryError');
    expect(ctx.sentryError).toBeInstanceOf(Object);
    expect(ctx.sentryError).toMatchObject({
      extra: '',
      status: HTTPStatus.INTERNAL_SERVER_ERROR,
      message: 'The api\'s parameters are invalid',
      req: undefined,
      tags: { path: 'dataMiddleware', type: 'data' },
      fingerprint: ['test'],
      level: 'debug',
    });
  });
});
