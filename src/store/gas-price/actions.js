import gasPrice from '@/services/gas-price';

const getGasPrice = async ({ dispatch }) => {
  try {
    return await gasPrice.getGasPrice();
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });

    return null;
  }
};

export default {
  getGasPrice,
};
