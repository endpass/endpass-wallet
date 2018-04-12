export default {
  namespaced: true,
  state: {
    accounts: [],
    activeAccount: null
  },
  mutations: {
    add(state, account) {
      state.accounts.push(account);
      state.activeAccount = state.accounts[state.accounts.length - 1];
    },
    remove(state, index) {
      if(state.activeAccount === state.accounts[index]) {
        state.activeAccount = state.accounts.length ? state.accounts[0] : null;
      }
      state.accounts.splice(index,1);
    },
    select(state, index) {
      state.activeAccount = state.accounts[index];
    }
  }
}
