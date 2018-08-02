import gasPrice from '@/services/gas-price';

export default {
  namespaced: true,
  state: {},
  actions: {
    getGasPrice({ dispatch }) {
      return gasPrice.getGasPrice().catch(e => {
        dispatch('errors/emitError', e, { root: true });
      });
    },
  },
};
