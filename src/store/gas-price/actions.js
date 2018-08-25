import gasPrice from '@/services/gas-price';

const getGasPrice = async ({ dispatch }) => {
  try {
    const price = await gasPrice.getGasPrice();
    return price;
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

export default {
  getGasPrice,
};
