import { gasPrice } from 'fixtures/gasPrice';

export default {
  getGasPrice() {
    return jest.fn().mockResolvedValue(gasPrice);
  },
};
