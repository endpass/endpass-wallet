import Vue from 'vue';
import Vuex from 'vuex';

import accounts from './accounts/accounts';
import tokens from './tokens';
import web3 from './web3/web3';
import gasPrice from './gas-price';
import price from './price';
import transactions from './transactions/transactions';
import errors from './errors';
import connectionStatus from './connection-status';
import userModule from './user';

Vue.use(Vuex);

const state = {
  isPageLoading: false, //global page loading
};

export const mutations = {
  startPageLoading(state) {
    state.isPageLoading = true;
  },
  stopPageLoading(state) {
    state.isPageLoading = false;
  },
};

export const actions = {
  // Dispatch all Vuex init() actions
  async init({ dispatch, commit }) {
    commit('startPageLoading');

    // Wait for accounts to load first
    await dispatch('accounts/init');

    commit('stopPageLoading');
    await dispatch('web3/init');

    return Promise.all([
      dispatch('tokens/init'),
      dispatch('price/init'),
      dispatch('connectionStatus/init'),
    ]);
  },
};

const store = new Vuex.Store({
  state,
  mutations,
  actions,
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
