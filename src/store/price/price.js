import priceService from '@/services/price';
import { priceUpdateInterval } from '@/config';

export default {
  namespaced: true,
  state: {
    price: null,
    updateTime: null,
    isLoading: false,
    interval: null, //interval id of setInterval for price updates
  },
  mutations: {
    setPrice(state, price) {
      state.price = price;
    },
    setUpdateTime(state, updateTime) {
      state.updateTime = updateTime;
    },
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
    },
    setInterval(state, interval) {
      state.interval = interval;
    },
  },
  actions: {
    async updatePrice({ commit, dispatch, rootState }) {
      try {
        commit('startLoading');
        let price = await priceService.getPrice(
          rootState.web3.activeCurrency.name,
          rootState.accounts.settings.fiatCurrency,
        );
        commit('setPrice', price[rootState.accounts.settings.fiatCurrency]);
        commit('setUpdateTime', new Date().time);
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
        commit('stopLoading');
      }
    },
    // Start polling for fiat price
    subscribeOnPriceUpdates({ commit, dispatch }) {
      const interval = setInterval(() => {
        dispatch('updatePrice');
      }, priceUpdateInterval);
      commit('setInterval', interval);
    },
    // Stop polling for fiat price
    unsubscribeOnPriceUpdates({ commit, state }) {
      if (!state.interval) {
        return;
      }
      clearInterval(state.interval);
      commit('setInterval', null);
    },
    init({ dispatch }) {
      return dispatch('subscribeOnPriceUpdates');
    },
  },
};
