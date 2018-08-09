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
    // prettier-ignore
    availableCurrencies: ['USD', 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR'],
    settings: {
      fiatCurrency: 'USD',
    },
    otpSettings: {
      secret: null,
      status: null,
    },
  },
  getters: {
    isPublicAccount(state) {
      return (
        state.address instanceof Address && !(state.wallet instanceof Wallet)
      );
    },
    balance(state, getters, rootState, rootGetters) {
      if (state.balance === null) return null;

      const pendingBalance = rootGetters['transactions/pendingBalance'];
      const balanceWei = BigNumber(state.balance || '0')
        .minus(pendingBalance)
        .toFixed();

      return web3.utils.fromWei(balanceWei);
    },
  },
  mutations: {
    setAddress(state, addressString) {
      state.address = new Address(addressString);
    },
    setWallet(state, wallet) {
      state.wallet = wallet;
    },
    addWallet(state, walletV3) {
      const wallet = new Wallet(walletV3);
      const { address } = walletV3;
      state.wallets = {
        ...state.wallets,
        [address]: wallet,
      };
    },
    addHdWallet(state, wallet) {
      state.hdWallet = wallet;
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
    setEmail(state, email) {
      state.email = email;
    },
    setOtpSettings(state, otpSettings) {
      state.otpSettings = otpSettings;
    },
  },
  actions: {
    selectWallet({ commit, state, dispatch }, address) {
      commit('setWallet', state.wallets[address]);
      commit('setAddress', address);
      dispatch('tokens/subscribeOnTokenUpdates', {}, { root: true });
    },
    addWallet({ commit, dispatch, state }, json) {
      json.address = web3.utils.toChecksumAddress(json.address);
      commit('addWallet', json);

      return userService
        .setAccount(json)
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    addWalletAndSelect({ dispatch }, json) {
      return dispatch('addWallet', json)
        .then(() =>
          dispatch('selectWallet', web3.utils.toChecksumAddress(json.address)),
        )
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    addWalletWithV3({ commit, dispatch }, { json, password }) {
      const wallet = EthWallet.fromV3(json, password, true);
      const newJson = wallet.toV3(new Buffer(password), kdfParams);
      dispatch('addWalletAndSelect', newJson);
    },
    addWalletWithPrivateKey({ commit, dispatch }, { privateKey, password }) {
      const wallet = EthWallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
      const json = wallet.toV3(new Buffer(password), kdfParams);

      return dispatch('addWalletAndSelect', json);
    },
    generateWallet({ commit, dispatch, state }, password) {
      if (!state.hdWallet) {
        return;
      }
      let i = Object.keys(state.wallets).length;
      let wallet = state.hdWallet.deriveChild(i).getWallet();
      dispatch(
        'addWalletAndSelect',
        wallet.toV3(new Buffer(password), kdfParams),
      );
    },
    addHdWallet({ commit, dispatch }, { key, password }) {
      const seed = Bip39.mnemonicToSeed(key);
      const hdKey = HDKey.fromMasterSeed(seed);
      const hdWallet = hdKey.derivePath(hdKeyMnemonic.path);
      const wallet = hdWallet.deriveChild(0).getWallet();
      commit('addHdWallet', hdWallet);
      return dispatch(
        'addWalletAndSelect',
        wallet.toV3(new Buffer(password), kdfParams),
      );
    },
    async addMultiHdWallet({ commit, dispatch, rootState }, { key, password }) {
      const seed = Bip39.mnemonicToSeed(key);
      const hdKey = HDKey.fromMasterSeed(seed);
      const hdWallet = hdKey.derivePath(hdKeyMnemonic.path);
      commit('addHdWallet', hdWallet);

      /* eslint-disable no-await-in-loop */
      for (let index = 0; index < 5; index++) {
        const wallet = hdWallet.deriveChild(index).getWallet();
        const walletV3 = wallet.toV3(Buffer.from(password), kdfParams);
        const { address } = walletV3;

        if (index !== 0) {
          dispatch('addWallet', walletV3);
        } else {
          dispatch('addWalletAndSelect', walletV3);
        }

        try {
          const balance = await rootState.web3.web3.eth.getBalance(address);

          if (balance === '0') {
            break;
          }
        } catch (e) {
          break;
        }
      }
      /* eslint-enable no-await-in-loop */
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
      return Promise.all([storage.clear(), userService.logout()]).catch(e =>
        dispatch('errors/emitError', e, { root: true }),
      );
    },
    loginViaOTP({}, { code }) {
      return userService.loginViaOTP(code);
    },
    getOtpSettings({ commit, dispatch }) {
      return userService
        .getOtpSettings()
        .then(otpSettings => commit('setOtpSettings', otpSettings))
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    setOtpSettings({ commit, dispatch }, { secret, code }) {
      return userService
        .setOtpSettings(secret, code)
        .then(() => commit('setOtpSettings', { status: 'enabled' }))
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    deleteOtpSettings({ commit, dispatch }, { code }) {
      return userService
        .deleteOtpSettings(code)
        .then(() => {
          commit('setOtpSettings', {});
          dispatch('getOtpSettings');
        })
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    init({ commit, dispatch }) {
      return Promise.all([storage.read('settings'), storage.read('email')])
        .then(([settings, email]) => {
          commit('setEmail', email);

          if (settings) {
            commit('setSettings', settings);
          }

          if (!email) {
            storage.disableRemote();
          }

          return email ? userService.getV3Accounts() : null;
        })
        .then(accounts => {
          if (accounts && accounts.length) {
            accounts.forEach(wallet => commit('addWallet', wallet));
            dispatch('selectWallet', accounts[0].address);
          }
        })
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
  },
};
