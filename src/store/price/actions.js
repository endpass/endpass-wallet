import { get } from 'lodash';
import { cryptoDataService } from '@/services';
import {
  SET_PRICE,
  SET_UPDATE_TIME,
  START_LOADING,
  STOP_LOADING,
  SET_INTERVAL_ID,
} from './mutations-types';

const updatePrice = async ({ commit, getters, dispatch }) => {
  try {
    commit(START_LOADING);

    const price = await cryptoDataService.getSymbolsPrice(
      getters.activeCurrencyName,
      getters.fiatCurrency,
    );

    commit(SET_PRICE, get(price, `ETH.${getters.fiatCurrency}`, 0));
    commit(SET_UPDATE_TIME, new Date().getTime());
    dispatch(
      'connectionStatus/updateApiErrorStatus',
      {
        id: 'price',
        status: true,
      },
      { root: true },
    );
  } catch (e) {
    e.apiError = {
      id: 'price',
      status: false,
    };
    dispatch('errors/emitError', e, { root: true });
  } finally {
    commit(STOP_LOADING);
  }
};

// Start polling for fiat price
const subscribeOnPriceUpdates = ({ commit, dispatch }) => {
  const intervalId = setInterval(() => {
    dispatch('updatePrice');
  }, ENV.priceUpdateInterval);
  commit(SET_INTERVAL_ID, intervalId);
};

const init = async ({ dispatch }) => {
  await dispatch('updatePrice');
  return dispatch('subscribeOnPriceUpdates');
};

export default {
  updatePrice,
  subscribeOnPriceUpdates,
  init,
};
