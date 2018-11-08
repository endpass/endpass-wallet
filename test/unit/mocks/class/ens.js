jest.mock('@/class/ens', () => {
  /* eslint-disable global-require */
  const { address } = require('fixtures/accounts');

  return {
    getAddress: jest.fn().mockResolvedValue(address),
  };
});
