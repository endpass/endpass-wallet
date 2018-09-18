jest.mock('@/services/gas-price', () => {
  /* eslint-disable global-require */
  const { gasPrice } = require('fixtures/gasPrice');

  return {
    getGasPrice: jest.fn().mockResolvedValue(gasPrice),
  };
});
