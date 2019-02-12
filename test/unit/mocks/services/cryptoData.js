jest.mock('@/services/cryptoData', () => {
  /* eslint-disable global-require */
  const { priceMulti } = require('fixtures/price');
  const { gasPrice } = require('fixtures/gasPrice');
  const { pendingTransactions } = require('fixtures/cryptoData');

  return {
    getSymbolsPrices: jest.fn().mockResolvedValue(priceMulti),
    getGasPrice: jest.fn().mockResolvedValue(gasPrice),
    getPendingTransactions: jest.fn().mockResolvedValue(pendingTransactions),
  };
});
