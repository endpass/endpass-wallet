import gasPrice from '@/services/gas-price';

const getGasPrice = async ({ dispatch }) => {
  try {
    return await gasPrice.getGasPrice();
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

export default {
  getGasPrice,
};
