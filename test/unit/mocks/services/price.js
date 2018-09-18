jest.mock('@/services/price', () => {
  /* eslint-disable global-require */
  const { price } = require('fixtures/price');

  return {
    getPrice: jest.fn().mockResolvedValue(price),

    getEthPrice: jest.fn().mockResolvedValue(price),

    getPrices: jest.fn().mockResolvedValue({
      ETH: price,
    }),
  };
});
