jest.mock('@/services/cryptoData', () => {
  /* eslint-disable global-require */
  const { priceMulti } = require('fixtures/price');
  const { gasPrice } = require('fixtures/gasPrice');

  return {
    getSymbolsPrice: jest.fn().mockResolvedValue(priceMulti),
    getGasPrice: jest.fn().mockResolvedValue(gasPrice),
  };
});
