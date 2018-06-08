import storage from '@/services/storage';

export default {
  namespaced: true,
  state: {
    hdWallet: null,
    accounts: [],
    activeAccount: null,
    balance: null,
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
    }
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
      if (state.hdWallet) {
        return
      }
      state.hdWallet = wallet
    },
    addTransaction(state, transaction) {
      state.pendingTransactions.push(transaction);
    },
    removeTransaction(state, trxHash) {
      let trxIndex = state.pendingTransactions.findIndex((trx) => {
        return trx.hash === trxHash;
      });
      if(state.pendingTransactions[trxIndex].canseled)
        return
      state.pendingTransactions.splice(trxIndex,1);
    },
    canselTransaction(state, trxHash) {
      let trxIndex = state.pendingTransactions.findIndex((trx) => {
        return trx.hash === trxHash;
      });
      state.pendingTransactions[trxIndex].canseled = true;
    },
    updateTransaction(state, updates) {
      let trxIndex = state.pendingTransactions.findIndex((trx) => {
        return trx.hash === updates.oldHash;
      });
      Object.assign(state.pendingTransactions[trxIndex], updates.newTrx);
    },
    setBalance(state, balance) {
      state.balance = balance;
    },
    setSettings(state, settings) {
      state.settings = JSON.parse(JSON.stringify(settings));
    },
  },
  actions: {
    addAccount({ commit, dispatch }, account) {
      commit('addAccount', account);
      return dispatch('setActiveAccount', account);
    },
    setActiveAccount({ commit, dispatch }, account) {
      commit('setActiveAccount', account);
      return Promise.all([
        dispatch('updateBalance'),
        dispatch('tokens/subscribeOnTokenUpdates',{}, {root: true})
      ]);
    },
    updateBalance(context) {
      if(context.rootState.accounts.activeAccount) {
        let address = context.rootState.accounts.activeAccount.getAddressString();
        let balance = context.rootState.web3.web3.eth.getBalance(address).then((balance) => {
          context.commit('setBalance', balance);
        }).catch(e => {
          console.error(e, 'bal');
        });
      }
    },
    updateSettings({ commit }, settings) {
      commit('setSettings', settings);
      return storage.write('settings', settings);
    },
    init({ commit }) {
      return storage
        .read('settings')
        .then(settings => {
          if (settings) {
            commit('setSettings', settings);
          }
        })
        .catch(e => console.error(e));
    },
  }
}
