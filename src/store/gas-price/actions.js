import { cryptoDataService } from '@/services';

const getGasPrice = async ({ dispatch, rootGetters }) => {
  try {
    return await cryptoDataService.getGasPrice();
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });

    return null;
  }
};

export default {
  getGasPrice,
};
