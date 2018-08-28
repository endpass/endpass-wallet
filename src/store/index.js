import Vue from 'vue';
import Vuex from 'vuex';

import accounts from './accounts/accounts';
import tokens from './tokens';
import web3 from './web3/web3';
import gasPrice from './gas-price/gas-price';
import price from './price';
import transactions from './transactions/transactions';
import errors from './errors';
import connectionStatus from './connection-status';
import userModule from './user';

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    isPageLoading: false, //global page loading
  },
  mutations: {
    startPageLoading(state) {
      state.isPageLoading = true;
    },
    stopPageLoading(state) {
      state.isPageLoading = false;
    },
  },
  actions: {
    // Dispatch all Vuex init() actions
    init({ dispatch }) {
      dispatch('accounts/init');
      dispatch('web3/init');
      dispatch('tokens/init');
      dispatch('price/init');
      dispatch('connectionStatus/init');
    },
  },
  modules: {
    accounts,
    web3,
    tokens,
    price,
    gasPrice,
    transactions,
    errors,
    connectionStatus,
    user: userModule,
  },
  //TODO enable strict
  //strict: process.env.NODE_ENV !== 'production',
});

export default store;
