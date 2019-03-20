jest.mock('@/services/localSettings', () => {
  /* eslint-disable global-require */
  const { address } = require('fixtures/accounts');

  return {
    save: jest.fn(),

    load: jest.fn(() => ({
      activeAccount: address,
    })),

    clear: jest.fn(),
  };
});
