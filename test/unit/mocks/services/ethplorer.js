jest.mock('@/services/ethplorer', () => {
  /* eslint-disable global-require */
  const {
    ethplorerTransactions,
    ethplorerHistory,
  } = require('fixtures/transactions');
  const { tokens } = require('fixtures/tokens');

  const { checksumAddress } = require('fixtures/accounts');

  return {
    getTransactions: jest.fn().mockResolvedValue(ethplorerTransactions),

    getHistory: jest.fn().mockResolvedValue(ethplorerHistory),

    getTransactionHistory: jest
      .fn()
      .mockResolvedValue([].concat(ethplorerHistory, ethplorerTransactions)),

    getInfo: jest.fn().mockResolvedValue([
      {
        id: '1',
        to: checksumAddress,
      },
    ]),

    tokenIsNotSpam: jest.fn().mockResolvedValue(true),

    getTokensWithBalance: jest.fn().mockResolvedValue(tokens),
  };
});
