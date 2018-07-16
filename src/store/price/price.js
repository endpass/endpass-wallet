import priceService from '@/services/price';
import { subscriptionsAPIInterval } from '@/config';

export default {
  namespaced: true,
  state: {
    price: null,
    updated: null,
  },
  mutations: {
    setPrice(state, price) {
      state.price = price;
    },
    setUpdateTime(state, updateTime) {
      state.updateTime = updateTime;
    },
  },
  actions: {
    updatePrice({ commit, dispatch, rootState }) {
      let price = priceService.getEthPrice(
        rootState.accounts.settings.fiatCurrency,
      );
      price
        .then(resp => {
          commit('setPrice', resp[rootState.accounts.settings.fiatCurrency]);
          commit('setUpdateTime', new Date().time);
          dispatch(
            'connectionStatus/updateApiErrorStatus',
            {
              id: 'price',
              status: true,
            },
            { root: true },
          );
        })
        .catch(e => {
          e.apiError = {
            id: 'price',
            status: false,
          };
          dispatch('errors/emitError', e, { root: true });
        });
      return price;
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
