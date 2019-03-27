jest.mock('@/services/hardware', () => {
  /* eslint-disable global-require */
  const { addresses } = require('fixtures/accounts');

  return {
    getNextWallets: jest.fn().mockResolvedValue({
      xpub: addresses[0],
      addresses,
    }),
  };
});
