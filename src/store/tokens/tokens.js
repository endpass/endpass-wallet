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
      // TODO check for errors here, activeTokens is undefined
      const tokens = state.activeTokens || []
      return tokens.map((token) => {
        return {
          address: token.tokenInfo.address
        }
      }).concat(state.savedTokens)
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
      state.tokensSerializeInterval = interval;
    },
    saveSubscription(state, subscription) {
      state.tokensSubscription = subscription;
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
        if (context.state.tokensSubscription) {
          let balances = context.state.tokensSubscription.serialize();
          // TODO check for errors here
          if (balances.length && typeof balances[0].symbol !== 'undefined')
            context.commit('saveTokens', balances);
        }
      }, 4000);
      context.commit('saveInterval', interval);
      context.commit('saveSubscription', subscription);
    },
    getNonZeroTokens(context) {
      return new Promise((res, rej) => {
        let address = context.rootState.accounts.activeAccount.getAddressString();
        EthplorerService.getTransactions(address).then((resp)=> {
          context.commit('saveTokens', resp.data.tokens);
          res();
        });
      });
    }
  }
}
