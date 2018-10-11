jest.mock('@/services/tokeninfo', () => {
  /* eslint-disable global-require */
  const { tokens } = require('fixtures/tokens');

  return {
    getTokensList: jest.fn().mockResolvedValue(tokens),
  };
});
