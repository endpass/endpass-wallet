import { cryptoDataService } from '@/services';

const getGasPrice = async ({ dispatch, rootGetters }) => {
  try {
    const networkId = rootGetters['web3/activeNetwork'];

    return await cryptoDataService.getGasPrice(networkId);
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });

    return null;
  }
};

export default {
  getGasPrice,
};
