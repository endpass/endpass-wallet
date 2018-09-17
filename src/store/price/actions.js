import priceService from '@/services/price';
import { priceUpdateInterval } from '@/config';
import {
  SET_PRICE,
  SET_UPDATE_TIME,
  START_LOADING,
  STOP_LOADING,
  SET_INTERVAL,
} from './mutations-types';

const updatePrice = async ({ commit, getters, dispatch }) => {
  try {
    commit(START_LOADING);
    const price = await priceService.getPrice(
      getters.activeCurrencyName,
      getters.fiatCurrency,
    );
    commit(SET_PRICE, price[getters.fiatCurrency]);
    commit(SET_UPDATE_TIME, new Date().time);
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
  const interval = setInterval(() => {
    dispatch('updatePrice');
  }, priceUpdateInterval);
  commit(SET_INTERVAL, interval);
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
