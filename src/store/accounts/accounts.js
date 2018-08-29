import { userService } from '@/services';
import storage from '@/services/storage';
import web3 from 'web3';
import Bip39 from 'bip39';
import HDKey from 'ethereumjs-wallet/hdkey';
import { hdKeyMnemonic, kdfParams } from '@/config';
import EthWallet from 'ethereumjs-wallet';
import { SAVE_TOKENS } from '@/store/tokens/mutations-types';
import { Wallet, Address } from '@/class';
import { BigNumber } from 'bignumber.js';
import keystore from '@/utils/keystore';

export default {
  namespaced: true,
  state: {
    // TODO move to user store?
    email: null,
    // The encrypted xprv key for the user's hd wallet as a V3 keystore
    // object. All accounts are direct child accounts.
    hdKey: null,
    // The user's wallets, keyed by address
    wallets: {},
    // The currently selected wallet
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
    // TODO move to user store?
    isLoggedIn(state) {
      return !!state.email;
    },
    balance(state, getters, rootState, rootGetters) {
      if (state.balance === null) return null;

      const pendingBalance = rootGetters['transactions/pendingBalance'];
      const balanceWei = BigNumber(state.balance || '0')
        .minus(pendingBalance)
        .toFixed();

      return web3.utils.fromWei(balanceWei);
    },
    // Returns a decrypted HD Wallet
    hdWallet: state => password => {
      if (!state.hdKey) {
        return null;
      }
      return keystore.decryptHDWallet(password, state.hdKey);
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
    // Saves the encrypted HD wallet key in V3 keystore format
    // Formerly addHdWallet
    setHdKey(state, key) {
      state.hdKey = key;
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
      return dispatch(
        'tokens/subscribeOnTokensBalancesUpdates',
        {},
        { root: true },
      );
    },
    addWallet({ commit, dispatch, state }, json) {
      json.address = web3.utils.toChecksumAddress(json.address);
      commit('addWallet', json);

      return userService
        .setAccount(json.address, json)
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    addWalletAndSelect({ dispatch }, json) {
      return dispatch('addWallet', json)
        .then(() =>
          dispatch('selectWallet', web3.utils.toChecksumAddress(json.address)),
        )
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    // Import wallet from json V3 keystore
    async addWalletWithV3({ commit, dispatch }, { json, password }) {
      try {
        const wallet = new Wallet(json);
        let privateKey = await wallet.getPrivateKey(password);
        return dispatch('addWalletWithPrivateKey', privateKey);
      } catch (e) {
        return dispatch('errors/emitError', e, { root: true });
      }
    },
    async addWalletWithPrivateKey(
      { commit, dispatch },
      { privateKey, password },
    ) {
      try {
        const wallet = EthWallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
        const json = keystore.encryptWallet(password, wallet);
        return dispatch('addWalletAndSelect', json);
      } catch (e) {
        return dispatch('errors/emitError', e, { root: true });
      }
    },
    generateWallet({ commit, dispatch, state, getters }, password) {
      if (!state.hdKey) {
        return;
      }
      try {
        let hdWallet = getters.hdWallet(password);
        let i = Object.keys(state.wallets).length;
        let wallet = hdWallet.deriveChild(i).getWallet();
        let json = keystore.encryptWallet(password, wallet);
        return dispatch('addWalletAndSelect', json);
      } catch (e) {
        return dispatch('errors/emitError', e, { root: true });
      }
    },
    // Saves HD wallet's extended keys on the server
    saveHdWallet({ commit, dispatch, state }, json) {
      return userService.setAccount(json.address, json);
    },
    addHdWallet({ commit, dispatch }, { key, password }) {
      const seed = Bip39.mnemonicToSeed(key);
      const hdKey = HDKey.fromMasterSeed(seed);
      const hdWallet = hdKey.derivePath(hdKeyMnemonic.path);
      // Encrypt extended private key
      const json = keystore.encryptHDWallet(password, hdWallet);
      commit('setHdKey', json);

      // Save HD keys and generate the first child wallet
      return dispatch('saveHdWallet', json)
        .then(() => dispatch('generateWallet', password))
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    async addMultiHdWallet({ commit, dispatch, rootState }, { key, password }) {
      const seed = Bip39.mnemonicToSeed(key);
      const hdKey = HDKey.fromMasterSeed(seed);
      const hdWallet = hdKey.derivePath(hdKeyMnemonic.path);

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
        const address = state.address.getChecksumAddressString();

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
      return Promise.all([storage.clear(), userService.logout()])
        .then(() => window.location.reload())
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    loginViaOTP({}, { code, email }) {
      return userService.loginViaOTP(code, email);
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
    async init({ commit, dispatch }) {
      try {
        let [settings, email] = await Promise.all([
          userService.getSettings(),
          storage.read('email'),
        ]);

        commit(`tokens/${SAVE_TOKENS}`, settings.tokens || {}, { root: true });
        commit('setEmail', email);

        if (settings) {
          commit('setSettings', settings);
        }

        if (!email) {
          storage.disableRemote();
          return null;
        }

        // Fetch and save HD wallet
        let hdKey = await userService.getHDKey();
        if (hdKey) {
          commit('setHdKey', hdKey);
        }

        // Fetch and save regular accounts
        let accounts = await userService.getV3Accounts();
        if (accounts && accounts.length) {
          accounts.forEach(wallet => commit('addWallet', wallet));
          await dispatch('selectWallet', accounts[0].address);
        }
      } catch (e) {
        return dispatch('errors/emitError', e, { root: true });
      }
    },
  },
};
