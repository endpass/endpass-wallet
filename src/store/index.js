import Vue from 'vue';
import Vuex from 'vuex';

import accounts from './accounts/accounts';
import tokens from './tokens/tokens';
import web3 from './web3/web3';
import price from './price/price';

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {},
  mutations: {},
  actions: {
    init({ dispatch }, actions) {
      actions
        .filter(act => act.includes('/init'))
        .forEach(action => dispatch(action));
    },
  },
  modules: {
    accounts,
    web3,
    tokens,
    price
  },
});

store.dispatch('init', Object.keys(store._actions));

export default store;
