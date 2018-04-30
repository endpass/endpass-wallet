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
        });
      }
    }
  }
}
