import Vue from 'vue';
import Vuex from 'vuex';

import actions from './actions';
import mutations from './mutations';

import accounts from './accounts';
import tokens from './tokens';
import web3 from './web3';
import gasPrice from './gas-price';
import price from './price';
import transactions from './transactions';
import errors from './errors';
import connectionStatus from './connection-status';
import userModule from './user';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    isPageLoading: false,
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
  strict: !ENV.isProduction,
  mutations,
  actions,
});

// Dispatch on change in block number
// This triggers when a new block is found OR network provider is changed
store.watch(
  state => state.web3.blockNumber,
  () =>
    Promise.all([
      store.dispatch('accounts/updateBalance'),
      store.dispatch('tokens/getCurrentAccountTokensData'),
    ]),
);

// Enable hot reloading in development
if (module.hot) {
  module.hot.accept(
    [
      './mutations',
      './actions',
      './accounts',
      './web3',
      './tokens',
      './gas-price',
      './price',
      './transactions',
      './errors',
      './connection-status',
      './user',
    ],
    () => {
      /* eslint-disable global-require */
      const newMutations = require('./mutations').default;
      const newActions = require('./actions').default;
      const newAccounts = require('./accounts').default;
      const newWeb3 = require('./web3').default;
      const newTokens = require('./tokens').default;
      const newGasPrice = require('./gas-price').default;
      const newPrice = require('./price').default;
      const newTransactions = require('./transactions').default;
      const newErrors = require('./errors').default;
      const newConnectionStatus = require('./connection-status').default;
      const newUserModule = require('./user').default;

      // swap in the new actions and mutations
      store.hotUpdate({
        mutations: newMutations,
        actions: newActions,
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
