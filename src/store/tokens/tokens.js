import TokenTracker from 'eth-token-tracker'
import EthplorerService from '@/services/ethplorer'

export default {
  namespaced: true,
  state() {
    let savedTokens = JSON.parse(localStorage.getItem('tokens') || '[]');
    return {
      // tokens from subscribtipn
      activeTokens: [],
      //tokens from localStorage
      savedTokens,
      tokensSubscription: null,
      tokensSerializeInterval: null
    }
  },
  mutations: {
    saveTokenToWatchStorage(state, token) {
      state.savedTokens.push(token);
      localStorage.setItem('tokens', JSON.stringify(state.savedTokens));
    },
    saveTokens(state, tokens) {
      // TODO check for errors here, activeTokens is undefined
      state.activeTokens = tokens || []
    },
    saveInterval(state, interval) {
      state.tokensSerializeInterval = interval;
    },
    saveSubscription(state, subscription) {
      state.tokensSubscription = subscription;
    }
  },
  actions: {
    addTokenToSubscribtion(context, token) {
      // Save token without blance for furer seances
      context.commit('saveTokenToWatchStorage', token);
      context.state.tokensSubscription.add({
        address: token.address
      });
    },
    subscribeOnTokenUpdates(context) {
      //destroy old subscription and recreate new one (in case of addres/provider change)
      if(context.rootState.accounts.activeAccount) {
        if(context.state.tokensSerializeInterval) {
          clearInterval(context.state.tokensSerializeInterval);
          context.state.tokensSubscription.stop();
        }
        // get tokens with balances
        context.dispatch('getNonZeroTokens').then((resp)=> {
          context.dispatch('createTokenSubscribtion', resp.data.tokens || []);
        });
      }
    },
    createTokenSubscribtion(context, nonZerotokens) {
      const address = context.rootState.accounts.activeAccount.getAddressString();
      //remove repetitive tokens
      const filteredSavedTokensTokens = context.state.savedTokens.filter((savedToken) => {
        return !nonZerotokens.find((nonZeroToken) => {
          return nonZeroToken.tokenInfo.address === savedToken.address;
        });
      });
      const tokensToWatch = filteredSavedTokensTokens.concat(nonZerotokens.map((nonZeroToken) => {
        return {
          address: nonZeroToken.tokenInfo.address
        }
      }));
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
      let address = context.rootState.accounts.activeAccount.getAddressString();
      return EthplorerService.getTransactions(address);
    }
  }
}
