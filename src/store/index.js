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

    // init web3 networks
    await dispatch('web3/init');
    // Wait for accounts to load
    await dispatch('accounts/init');

    commit('stopPageLoading');

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
  strict: process.env.NODE_ENV !== 'production',
});

// Dispatch on change in block number
// This triggers when a new block is found OR network provider is changed
store.watch(
  state => state.web3.blockNumber,
  () => {
    return Promise.all([
      store.dispatch('accounts/updateBalance'),
      store.dispatch('tokens/updateTokensBalances'),
    ]);
  },
);

// Enable hot reloading in development
if (module.hot) {
  module.hot.accept(
    [
      './accounts/accounts',
      './web3/web3',
      './tokens',
      './gas-price',
      './price',
      './transactions/transactions',
      './errors',
      './connection-status',
      './user',
    ],
    () => {
      const newAccounts = require('./accounts/accounts').default;
      const newWeb3 = require('./web3/web3').default;
      const newTokens = require('./tokens').default;
      const newGasPrice = require('./gas-price').default;
      const newPrice = require('./price').default;
      const newTransactions = require('./transactions/transactions').default;
      const newErrors = require('./errors').default;
      const newConnectionStatus = require('./connection-status').default;
      const newUserModule = require('./user').default;
      // swap in the new actions and mutations
      store.hotUpdate({
        modules: {
          accounts: newAccounts,
          web3: newWeb3,
          tokens: newTokens,
          price: newPrice,
          gasPrice: newGasPrice,
          transactions: newTransactions,
          errors: newErrors,
          connectionStatus: newConnectionStatus,
          user: newUserModule,
        },
      });
    },
  );
}

export default store;
