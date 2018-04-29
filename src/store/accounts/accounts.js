import EthBlockTracker from 'eth-block-tracker';

export default {
  namespaced: true,
  state: {
    activeAccount: null,
    balance: null,
    balanceSubscribtion: false,
    pendingTransactions: []
  },
  mutations: {
    addAccount(state, account) {
      if (state.activeAccount) {
        return
      }
      state.activeAccount = account;
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
    setBalance(state, balance) {
      state.balance = balance;
    }
  },
  actions: {
    subscribeOnBalanceUpdates(context) {
      if(context.rootState.accounts.activeAccount) {
        if(this.balanceSubscribtion) {
          this.balanceSubscribtion.stop();
        }
        this.balanceSubscribtion = new EthBlockTracker({provider: context.rootState.web3.web3.currentProvider});
        this.balanceSubscribtion.on('latest', () => {
          context.dispatch('updateBalance');
        });
        this.balanceSubscribtion.start();
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
