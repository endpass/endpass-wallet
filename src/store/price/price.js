import priceService from '@/services/price';
import { subscriptionsAPIInterval } from '@/config';

export default {
  namespaced: true,
  state: {
    price: null,
    updateTime: null,
    isLoading: false,
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
    subsctibeOnPriceUpdates(context) {
      setInterval(() => {
        context.dispatch('updatePrice');
      }, subscriptionsAPIInterval);
    },
    init({ dispatch }) {
      return dispatch('subsctibeOnPriceUpdates');
    },
  },
};
