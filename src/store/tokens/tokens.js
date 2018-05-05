import  TokenTracker from 'eth-token-tracker'

export default {
  namespaced: true,
  state() {
    let savedTokens = JSON.parse(localStorage.getItem('tokens') || '[]');
    return {
      activeTokens: [],
      subscription: null,
      tokens: [],
      savedTokens
    }
  },
  mutations: {
    storeToken(state, tokenAddres) {
      state.savedTokens.push({address: tokenAddres});
      localStorage.setItem('tokens', JSON.stringify(state.savedTokens));
    },
    saveTokens(state, tokens) {
      state.activeTokens = tokens;
    },
    saveSubscription(state, subscription) {
      state.subscription = subscription;
    }
  },
  actions: {
    subscribeOnTokenUpdates(context, address) {
      context.state.subscription.add({address});
      context.commit('storeToken', address);
      let balances = context.state.subscription.serialize();
      context.commit('saveTokens', balances);
    },
    createSubscribtion(context) {
      let address = context.rootState.accounts.activeAccount.getAddressString();
      let subscription = new TokenTracker({
        userAddress: address,
        provider: context.rootState.web3.web3.currentProvider,
        pollingInterval: 40,
        tokens: context.state.savedTokens,
      })
      let balances = subscription.serialize();

      context.commit('saveTokens', balances);
      subscription.on('update', function (balances) {
        context.commit('saveTokens', balances);
      })
      subscription.on('error', function (reason) {
          console.log('there was a problem!', reason)
          console.trace(reason)
        })
      context.commit('saveSubscription', subscription);
    },
    stopSubscription() {

    },
    addTokenToSubscription() {

    }
  }
}
