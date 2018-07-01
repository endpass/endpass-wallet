import { userService } from '@/services'
import storage from '@/services/storage';
import web3 from 'web3';
import Bip39 from 'bip39';
import HDKey from 'ethereumjs-wallet/hdkey';
import { hdKeyMnemonic } from '@/config'
import EthWallet from 'ethereumjs-wallet';
import { Wallet, Address } from '@/class' ;
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
      return state.address instanceof Address && !state.wallet instanceof Wallet;
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
      return state.balance === null
        ? null
        : web3.utils.fromWei(BigNumber(state.balance || '0').minus(pendingBalance).toFixed());
    },
  },
  mutations: {
    addAddress(state ,addressString) {
      state.address = new Address(addressString);
    },
    addWallet(state, { wallet, address}) {
      state.wallets[address] = wallet;
    },
    addHdWallet(state, wallet) {
      state.hdWallet = wallet;
    },
    selectWallet(state, address) {
      state.wallet = state.wallets[address];
      state.address = new Address(address);
    },
    // Set HD wallet that generates accounts
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
    setEmail(state, email) {
      state.email = email;
    },
  },
  actions: {
    addWallet({ commit, dispatch }, json) {
      const wallet = new Wallet(json);
      commit('addWallet', {
        wallet,
        address: json.address});
      commit('selectWallet', json.address);
      commit('addAddress', json.address);
    },
    addWalletWithV3({ commit, dispatch }, {json, key, walletPassword}) {
      const wallet = EthWallet.fromV3(json, key, true);
      const newJson = wallet.toV3(new Buffer(walletPassword));
      dispatch('addWallet', newJson);
    },
    addWalletWithPrivateKey({ commit, dispatch }, {privateKey, password}) {
      const wallet = EthWallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
      const json = wallet.toV3(new Buffer(password));
      dispatch('addWallet', json);
    },
    generateWallet({commit, dispatch, state}, password){
      if (!state.hdWallet) {
        return
      }
      let i = Object.keys(state.wallets).length;
      let wallet = state.hdWallet.deriveChild(i).getWallet();
      dispatch('addWallet', wallet.toV3(new Buffer(password)));
    },
    addHdWallet({ commit, dispatch }, {key, password}) {
      const seed = Bip39.mnemonicToSeed(key);
      const hdKey = HDKey.fromMasterSeed(seed);
      const hdWallet = hdKey.derivePath(hdKeyMnemonic.path);
      const wallet = hdWallet.deriveChild(0).getWallet();
      commit('addHdWallet', hdWallet);
      dispatch('addWallet', wallet.toV3(new Buffer(password)));
    },
    updateBalance({ commit, dispatch, state, rootState }) {
      if (state.address) {
        const address = state.address.getAddressString();

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
    login({ commit, dispatch }, email) {
      return userService.login(email)
        .then(() => commit('setEmail', email))
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
