import EthBlockTracker from 'eth-block-tracker';

export default {
  namespaced: true,
  state: {
    accounts: [],
    activeAccount: null,
    balance: null,
    balaneSubscribtion: false,
    pendingTransactions: []
  },
  mutations: {
    addAccount(state, account) {
      state.accounts.push(account);
      state.activeAccount = state.accounts[state.accounts.length - 1];
    },
    addTransaction(state, transaction) {
      state.pendingTransactions.push(transaction);
    },
    removeTransaction(state, trxHash) {
      let trxIndex = state.accounts.findIndex((trx) => {
        trx.hash === trxHash;
      });
      state.pendingTransactions.splice(trxIndex,1);
    },
    removeAccount(state, index) {
      if(state.activeAccount === state.accounts[index]) {
        state.activeAccount = state.accounts.length ? state.accounts[0] : null;
      }
      state.accounts.splice(index,1);
    },
    selectAccount(state, index) {
      state.activeAccount = state.accounts[index];
    },
    setBalance(state, balance) {
      state.balance = balance;
    }
  },
  actions: {
    subscribeOnBalanceUpdates(context) {
      if(context.rootState.accounts.activeAccount) {
        if(this.balaneSubscribtion) {
          this.balaneSubscribtion.stop();
        }
        this.balaneSubscribtion = new EthBlockTracker({provider: context.rootState.web3.web3.currentProvider});
        this.balaneSubscribtion.on('latest', () => {
          context.dispatch('updateBalance');
        });
        this.balaneSubscribtion.start();
      }
    },
    updateBalance(context) {
      if(context.rootState.accounts.activeAccount) {
        let address = context.rootState.accounts.activeAccount.getAddressString();
        let balance = context.rootState.web3.web3.eth.getBalance(address).then((balance) => {
          console.log(balance);
          context.commit('setBalance', balance);
        }).catch(e => {
          console.log(e, 'bal');
          // context.dispatch('updateBalance');
        });
      }
    }
  }
}
