import { userService } from '@/services';
import storage from '@/services/storage';
import web3 from 'web3';
import Bip39 from 'bip39';
import HDKey from 'ethereumjs-wallet/hdkey';
import { hdKeyMnemonic, kdfParams } from '@/config';
import EthWallet from 'ethereumjs-wallet';
import { Wallet, Address } from '@/class';
import { BigNumber } from 'bignumber.js';

export default {
  namespaced: true,
  state: {
    email: null,
    hdWallet: null,
    wallets: {},
    wallet: null,
    address: null,
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
      return (
        state.address instanceof Address && !state.wallet instanceof Wallet
      );
    },
    balance(state, getters, rootState, rootGetters) {
      const pendingBalance = rootGetters['transactions/pendingBalance'];

      if (state.balance === null) return null;

      const balanceWei = BigNumber(state.balance || '0')
        .minus(pendingBalance)
        .toFixed();

      return web3.utils.fromWei(balanceWei);
    },
  },
  mutations: {
    addAddress(state, addressString) {
      state.address = new Address(addressString);
    },
    addWallet(state, { wallet, address }) {
      state.wallets[address] = wallet;
    },
    addHdWallet(state, wallet) {
      state.hdWallet = wallet;
    },
    setBalance(state, balance) {
      state.balance = balance;
    },
    setSettings(state, settings) {
      state.settings = JSON.parse(JSON.stringify(settings));
    },
    setEmail(state, email) {
      state.email = email;
    },
  },
  actions: {
    addWallet({ commit, dispatch }, json) {
      const wallet = new Wallet(json);
      commit('addWallet', {
        wallet,
        address: json.address,
      });
      dispatch('selectWallet', json.address);
      commit('addAddress', json.address);
    },
    selectWallet({ commit, state, dispatch }, address) {
      state.wallet = state.wallets[address];
      state.address = new Address(address);
      dispatch('tokens/subscribeOnTokenUpdates', {}, { root: true });
    },
    addWalletAndStore({ commit, dispatch }, json) {
      return Promise.all([
        dispatch('addWallet', json),
        userService.setAccount(json),
      ]).catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    addWalletWithV3({ commit, dispatch }, { json, password }) {
      const wallet = EthWallet.fromV3(json, password, true);
      const newJson = wallet.toV3(new Buffer(password), kdfParams);
      dispatch('addWalletAndStore', newJson);
    },
    addWalletWithPrivateKey({ commit, dispatch }, { privateKey, password }) {
      const wallet = EthWallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
      const json = wallet.toV3(new Buffer(password), kdfParams);
      dispatch('addWalletAndStore', json);
    },
    generateWallet({ commit, dispatch, state }, password) {
      if (!state.hdWallet) {
        return;
      }
      let i = Object.keys(state.wallets).length;
      let wallet = state.hdWallet.deriveChild(i).getWallet();
      dispatch(
        'addWalletAndStore',
        wallet.toV3(new Buffer(password), kdfParams),
      );
    },
    addHdWallet({ commit, dispatch }, { key, password }) {
      const seed = Bip39.mnemonicToSeed(key);
      const hdKey = HDKey.fromMasterSeed(seed);
      const hdWallet = hdKey.derivePath(hdKeyMnemonic.path);
      const wallet = hdWallet.deriveChild(0).getWallet();
      commit('addHdWallet', hdWallet);
      dispatch(
        'addWalletAndStore',
        wallet.toV3(new Buffer(password), kdfParams),
      );
    },
    updateBalance({ commit, dispatch, state, rootState }) {
      if (state.address) {
        const address = state.address.getAddressString();

        return rootState.web3.web3.eth
          .getBalance(address)
          .then(balance => commit('setBalance', balance))
          .catch(e => dispatch('errors/emitError', e, { root: true }));
      }
    },
    updateSettings({ commit, dispatch }, settings) {
      commit('setSettings', settings);
      return storage
        .write('settings', settings)
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    validatePassword({ state }, password) {
      return state.wallet.validatePassword(password);
    },
    login({ commit, dispatch }, email) {
      return userService.login(email);
    },
    logout({ commit, dispatch }) {
      commit('setEmail', null);
      return storage
        .clear()
        .then(() => (window.location = '/logout'))
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    init({ commit, dispatch }) {
      return Promise.all([
        storage.read('settings'),
        storage.read('email'),
        userService.getV3Accounts(),
      ])
        .then(([settings, email, accounts]) => {
          commit('setEmail', email);

          if (settings) {
            commit('setSettings', settings);
          }

          if (!email) {
            storage.disableRemote();
          }

          if (accounts && accounts.length) {
            accounts.forEach(wallet => dispatch('addWallet', wallet));
          }
        })
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
  },
};
