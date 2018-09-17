import { price } from 'fixtures/price';

export default {
  getPrice(symbol) {
    if (symbol === 'ETH-TEST') {
      return jest.fn().mockResolvedValue({
        USD: 0,
      });
    }

    return jest.fn().mockResolvedValue(price);
  },

  getEthPrice() {
    return jest.fn().mockResolvedValue(price);
  },

  getPrices() {
    return jest.fn().mockResolvedValue({
      ETH: price,
    });
  },
};
