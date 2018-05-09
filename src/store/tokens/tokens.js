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
    saveTokenToWatchStorage(state, address) {
      state.savedTokens.push({
        address
      });
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
      context.state.subscription.add({
        address
      })
      context.commit('saveTokenToWatchStorage', address);
    },
    getNonZeroTokens(context) {
      let address = context.rootState.accounts.activeAccount.getAddressString();
      return Vue.$http.get(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`);
    },
    getTokens(context) {
      return Vue.$http.get(`https://tokeninfo.endpass.com/api/v1/tokens`);
    },
    createSubscribtion(context) {
      if(context.state.subscription)
        context.state.subscription.stop();
      return new Promise((res, rej) => {
        context.dispatch('getNonZeroTokens').then((resp) => {
          let address = context.rootState.accounts.activeAccount.getAddressString();
          let nonZeroTokens = resp.body.tokens.map((token)=>{
            return {
              address : token.tokenInfo.address
            }
          });
          let tokensToWatch = nonZeroTokens.concat(context.state.savedTokens);
          let subscription = new TokenTracker({
            userAddress: address,
            provider: context.rootState.web3.web3.currentProvider,
            pollingInterval: 4000,
            tokens: tokensToWatch
          })
          setInterval(()=> {
            let balances = subscription.serialize();
            if (typeof balances[0].symbol !== 'undefined')
              context.commit('saveTokens', balances);
          }, 4000)
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
