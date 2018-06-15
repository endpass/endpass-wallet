import TokenTracker from 'eth-token-tracker';
import EthplorerService from '@/services/ethplorer';
import storage from '@/services/storage';

export default {
  namespaced: true,
  state() {
    return {
      // tokens from subscribtipn
      activeTokens: [],
      //tokens from localStorage
      savedTokens: [],
      tokensSubscription: null,
      tokensSerializeInterval: null,
    };
  },
  mutations: {
    saveTokenToWatchStorage(state, token) {
      state.savedTokens.push(token);
    },
    saveTokens(state, tokens = []) {
      // TODO check for errors here, activeTokens is undefined
      state.activeTokens = tokens;
    },
    saveTokensFromStorage(state, tokens = []) {
      state.savedTokens = tokens;
    },
    saveInterval(state, interval) {
      state.tokensSerializeInterval = interval;
    },
    saveSubscription(state, subscription) {
      state.tokensSubscription = subscription;
    },
  },
  actions: {
    addTokenToSubscription({ state, commit, dispatch }, token) {
      // Save token without blance for furer seances
      let tokenExist = state.tokensSubscription.tokens.find(
        subscribtionToken => {
          return subscribtionToken.address === token.address;
        }
      );
      if (!tokenExist) {
        commit('saveTokenToWatchStorage', token);
        storage
          .write('eth.mainnet.tokens.saved', state.savedTokens)
          .catch(e => console.error(e));
        state.tokensSubscription.add({
          ...token,
        });
      }
    },
    subscribeOnTokenUpdates({ dispatch, state, rootState }) {
      //destroy old subscription and recreate new one (in case of addres/provider change)
      if (rootState.accounts.activeAccount) {
        if (state.tokensSerializeInterval) {
          clearInterval(state.tokensSerializeInterval);
          state.tokensSubscription.stop();
        }
        // get tokens with balances
        return dispatch('getNonZeroTokens')
          .then(resp => {
            return dispatch('createTokenSubscription', resp.data.tokens || []);
          })
          .catch(e => {
            console.error(e);
            const title = 'Failed token subscription';
            const text = 'Token information won\'t be updated. Please reload page.';
            const error = Object.assign(e, { title, text });
            throw error;
          });
      }
    },
    createTokenSubscription(context, nonZerotokens) {
      const address = context.rootState.accounts.activeAccount.getAddressString();
      //remove repetitive tokens
      const filteredSavedTokensTokens = context.state.savedTokens.filter(
        savedToken => {
          return !nonZerotokens.find(nonZeroToken => {
            return nonZeroToken.tokenInfo.address === savedToken.address;
          });
        }
      );
      const tokensToWatch = filteredSavedTokensTokens.concat(
        nonZerotokens.map(nonZeroToken => {
          return {
            address: nonZeroToken.tokenInfo.address,
          };
        })
      );
      const subscription = new TokenTracker({
        userAddress: address,
        provider: context.rootState.web3.web3.currentProvider,
        pollingInterval: 4000,
        tokens: tokensToWatch,
      });
      const interval = setInterval(() => {
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
    },
    init({ commit }) {
      return storage
        .read('eth.mainnet.tokens.saved')
        .then(tokens => commit('saveTokensFromStorage', tokens || []))
        .catch(e => console.error(e));
    },
  },
};
