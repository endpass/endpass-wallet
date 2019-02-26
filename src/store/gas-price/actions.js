import { cryptoDataService } from '@/services';

const getGasPrice = async ({ dispatch, rootGetters }) => {
  try {
    const network = rootGetters['web3/activeNetwork'];

    return await cryptoDataService.getGasPrice(network);
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });

    return null;
  }
};

export default {
  getGasPrice,
};
