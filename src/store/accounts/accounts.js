import EthBlockTracker from 'eth-block-tracker';

export default {
  namespaced: true,
  state: {
    hdWallet: null,
    accounts: [],
    activeAccount: null,
    balance: null,
    balanceSubscribtion: false,
    pendingTransactions: []
  },
  mutations: {
    // Set HD wallet that generates accounts
    setWallet(state, wallet) {
      // Do not set wallet if already exists
      if (state.hdWallet) {
        return
      }
      state.hdWallet = wallet
    },
    // Add a new account to the list
    addAccount(state, account) {
      state.accounts.push(account)
      state.activeAccount = account
    },
    setActiveAccount(state, account) {
      state.activeAccount = account
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
