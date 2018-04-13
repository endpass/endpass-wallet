export default {
  namespaced: true,
  state: {
    accounts: [],
    activeAccount: null
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
    }
  }
}
