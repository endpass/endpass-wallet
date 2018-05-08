import  TokenTracker from 'eth-token-tracker'
import Vue from '../../main'

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
    saveTokens(state, tokens) {
      state.activeTokens = state.activeTokens.concat(tokens);
    },
    saveSubscription(state, subscription) {
      state.subscription = subscription;
    }
  },
  actions: {
    subscribeOnTokenUpdates(context, address) {
      context.state.subscription.add({address});
      let balances = context.state.subscription.serialize();
      context.commit('saveTokens', balances);
    },
    getNonZeroTokens(context) {
      let address = context.rootState.accounts.activeAccount.getAddressString();
      return Vue.$http.get(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`);
    },
    getTokens(context) {
      return Vue.$http.get(`https://tokeninfo.endpass.com/api/v1/tokens`);
    },
    createSubscribtion(context) {
      return new Promise((res, rej) => {
        context.dispatch('getNonZeroTokens').then((resp) => {
          let address = context.rootState.accounts.activeAccount.getAddressString();
          let subscription = new TokenTracker({
            userAddress: address,
            provider: context.rootState.web3.web3.currentProvider,
            pollingInterval: 40,
            tokens: resp.tokens,
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
          res();
        })
      });
    },
    stopSubscription() {

    },
    addTokenToSubscription() {

    }
  }
}
