import TokenTracker from 'eth-token-tracker'
import EthplorerService from '@/services/ethplorer'

export default {
  namespaced: true,
  state() {
    let savedTokens = JSON.parse(localStorage.getItem('tokens') || '[]');
    return {
      activeTokens: [],
      savedTokens,
      tokensSubscription: null,
      tokensSerializeInterval: null
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
    },
    saveInterval(state, interval) {
      state.tokensSubscription = interval;
    },
    saveSubscription(state, subscription) {
      state.tokensSerializeInterval = subscription;
    }
  },
  actions: {
    addTokenToSubscribtion(context, address) {
      context.commit('saveTokenToWatchStorage', address);
      context.state.tokensSubscription.add({
        address
      });
    },
    subscribeOnTokenUpdates(context) {
      if(context.rootState.accounts.activeAccount) {
        if(context.state.tokensSerializeInterval) {
          clearInterval(context.state.tokensSerializeInterval);
          context.state.tokensSubscription.stop();
        }
        context.dispatch('getNonZeroTokens').then(()=> {
          context.dispatch('createTokenSubscribtion');
        });
      }
    },
    createTokenSubscribtion(context) {
      const address = context.rootState.accounts.activeAccount.getAddressString();
      const tokensToWatch = context.getters.tokensToWatch;
      const subscription = new TokenTracker({
        userAddress: address,
        provider: context.rootState.web3.web3.currentProvider,
        pollingInterval: 4000,
        tokens: tokensToWatch
      });
      const interval = setInterval(()=> {
        let balances = this.subscription.serialize();
        if (typeof balances[0].symbol !== 'undefined')
          context.commit('saveTokens', balances);
      }, 4000);
      context.commit('saveInterval', interval);
      context.commit('saveSubscription', subscription);
    },
    getNonZeroTokens(context) {
      return new Promise((res, rej) => {
        let address = context.rootState.accounts.activeAccount.getAddressString();
        EthplorerService.getTransactions().then((resp)=> {
          context.commit('saveTokens', resp.body.tokens);
          res();
        });
      });
    }
  }
}
