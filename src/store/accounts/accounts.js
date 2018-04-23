export default {
  namespaced: true,
  state: {
    accounts: [],
    activeAccount: null,
    balance: null,
    balaneSubscribtion: false
  },
  mutations: {
    addAccount(state, account) {
      state.accounts.push(account);
      state.activeAccount = state.accounts[state.accounts.length - 1];
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
        if (context.rootState.web3.web3.eth.subsciptions) {
          console.log('unsub')
          context.rootState.web3.web3.eth.clearSubscriptions();
        }
        context.rootState.accounts.balaneSubscribtion = context.rootState.web3.web3.eth.subscribe('newBlockHeaders', (e, ret) => {
            if (e){
              console.log(e, 'sub');
              // context.dispatch('subscribeOnBalanceUpdates');
            } else {
              context.dispatch('updateBalance');
            }
        });
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
