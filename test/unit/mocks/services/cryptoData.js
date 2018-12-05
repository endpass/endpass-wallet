jest.mock('@/services/cryptoData', () => {
  /* eslint-disable global-require */
  const { price } = require('fixtures/price');
  const { gasPrice } = require('fixtures/gasPrice');

  return {
    getSymbolsPrice: jest.fn().mockResolvedValue({
      ETH: price,
    }),
    getGasPrice: jest.fn().mockResolvedValue(gasPrice),
  };
});
