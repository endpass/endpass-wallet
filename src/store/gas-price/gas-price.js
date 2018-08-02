import gasPrice from '@/services/gas-price';

export default {
  namespaced: true,
  state: {},
  actions: {
    getGasPrice() {
      return gasPrice.getGasPrice();
    },
  },
};
