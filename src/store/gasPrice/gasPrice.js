import gasPrice from '@/services/gasPrice';
import { subscriptionsAPIInterval } from '@/config';

export default {
  namespaced: true,
  state: {},
  actions: {
    getGasprice() {
      return gasPrice.getGasPrice();
    },
  },
};
