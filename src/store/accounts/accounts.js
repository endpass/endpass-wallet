import storage from '@/services/storage';
import web3 from 'web3';
import { BigNumber } from 'bignumber.js';

const { hexToNumberString, toWei } = web3.utils;

export default {
  namespaced: true,
  state: {
    hdWallet: null,
    accounts: [],
    activeAccount: null,
    balance: null,
    price: null,
    pendingTransactions: [],
    // prettier-ignore
    availableCurrencies: ['USD', 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR'],
    settings: {
      fiatCurrency: 'USD',
    },
  },
  getters: {
    isPublicAccount(state) {
      return state.activeAccount && state.activeAccount._privKey === null;
    },
    pendingBalance(state) {
      return state.pendingTransactions
        .filter(tnx => tnx.state === 'pending')
        .map(tnx => {
          const tnxValue = tnx.token === 'ETH' ? tnx.valueWei : '0';

          return BigNumber(tnx.gasCost).plus(tnxValue);
        })
        .reduce((total, item) => total.plus(item), BigNumber('0'))
        .toFixed();
    },
    balance(state, { pendingBalance }) {
      return BigNumber(state.balance || '0').minus(pendingBalance).toFixed();
    },
  },
  mutations: {
    addAccount(state, account) {
      state.accounts.push(account)
    },
    setActiveAccount(state, account) {
      state.activeAccount = account;
    },
    // Set HD wallet that generates accounts
    setWallet(state, wallet) {
      // Do not set wallet if already exists
      if (!state.hdWallet) {
        state.hdWallet = wallet
      }
    },
    addTransaction(state, transaction) {
      state.pendingTransactions.push(transaction);
    },
    removeTransaction(state, trxHash) {
      let trxIndex = state.pendingTransactions.findIndex((trx) => {
        return trx.hash === trxHash;
      });
      if(state.pendingTransactions[trxIndex].state === 'canseled')
        return
      state.pendingTransactions.splice(trxIndex,1);
    },
    canselTransaction(state, trxHash) {
      let trxIndex = state.pendingTransactions.findIndex((trx) => {
        return trx.hash === trxHash;
      });
      state.pendingTransactions[trxIndex].state = 'canseled';
    },
    updateTransaction(state, data) {
      const trxForUpdate = state.pendingTransactions.find(
        trx => trx.hash === data.hash
      );
      Object.assign(trxForUpdate, data);
    },
    setBalance(state, balance) {
      state.balance = balance;
    },
    setPrice(state, price) {
      state.price = price;
    },
    setSettings(state, settings) {
      state.settings = JSON.parse(JSON.stringify(settings));
    },
  },
  actions: {
    addAccount({ commit, dispatch }, account) {
      commit('addAccount', account);
      return dispatch('setActiveAccount', account).catch(e =>
        dispatch('errors/emitError', e, { root: true })
      );
    },
    setActiveAccount({ commit, dispatch }, account) {
      commit('setActiveAccount', account);
      return Promise.all([
        dispatch('updateBalance'),
        dispatch('tokens/subscribeOnTokenUpdates', {}, { root: true }),
      ]).catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    updateBalance({ commit, dispatch, rootState }) {
      if (rootState.accounts.activeAccount) {
        const address = rootState.accounts.activeAccount.getAddressString();

        return rootState.web3.web3.eth.getBalance(address)
          .then(balance => commit('setBalance', balance))
          .catch(e => dispatch('errors/emitError', e, { root: true }));
      }
    },
    updateSettings({ commit, dispatch }, settings) {
      commit('setSettings', settings);
      return storage.write('settings', settings)
        .catch(e => dispatch('errors/emitError', e, {root: true}));
    },
    init({ commit, dispatch }) {
      return storage
        .read('settings')
        .then(settings => {
          if (settings) {
            commit('setSettings', settings);
          }
        })
        .catch(e => dispatch('errors/emitError', e, {root: true}));
    },
  }
}
