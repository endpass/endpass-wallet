jest.mock('@/services/ethplorer', () => {
  /* eslint-disable global-require */
  const {
    ethplorerTransactions,
    ethplorerHistory,
  } = require('fixtures/transactions');
  const { checksumAddress } = require('fixtures/accounts');

  return {
    getTransactions: jest.fn().mockResolvedValue(ethplorerTransactions),

    getHistory: jest.fn().mockResolvedValue(ethplorerHistory),

    getInfo: jest.fn().mockResolvedValue([
      {
        id: '1',
        to: checksumAddress,
      },
    ]),

    tokenIsNotSpam: jest.fn().mockResolvedValue(true),
  };
});
