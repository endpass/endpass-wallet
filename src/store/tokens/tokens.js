import TokenTracker from 'eth-token-tracker'

export default {
  namespaced: true,
  state() {
    let savedTokens = JSON.parse(localStorage.getItem('tokens') || '[]');
    return {
      activeTokens: [],
      savedTokens
    }
  },
  getters: {
    tokensToWatch(state) {
      return state.activeTokens.concat(state.savedTokens)
    }
  },
  mutations: {
    saveTokenToWatchStorage(state, address) {
      state.savedTokens.push({
        address
      });
      localStorage.setItem('tokens', JSON.stringify(state.savedTokens));
    },
    saveTokens(state, tokens) {
      state.activeTokens = tokens;
    }
  }
}
