import TokenTracker from 'eth-token-tracker';
import EthplorerService from '@/services/ethplorer';
import price from '@/services/price';
import storage from '@/services/storage';
import { subscribtionsAPIInterval } from '@/config'
import { NotificationError } from '@/class';

export default {
  namespaced: true,
  state() {
    return {
      // tokens from subscribtipn
      activeTokens: [],
      //tokens from localStorage
      savedTokens: [],
      prices: null,
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
    setTokenPrices(state, prices) {
      state.prices = prices;
    },
    setTokenPrice(state, symbol, price) {
      if(!state.prices){
       state.prices = {};
      }
      state.prices[symbol] = price;
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
      const tokenExist = state.tokensSubscription.tokens.find(
        subscribtionToken => subscribtionToken.address === token.address
      );
      
      if (!tokenExist) {
        commit('saveTokenToWatchStorage', token);
        storage
          .write('eth.mainnet.tokens.saved', state.savedTokens)
          .catch(e => dispatch('errors/emitError', e, {root: true}));
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
            dispatch('subsctibeOnTokenPriceUpdates', resp.data.tokens || []);
            return dispatch('createTokenSubscription', resp.data.tokens || []);
          })
          .catch(() => {
            const error = NotificationError({
              title: 'Failed token subscription',
              text: 'Token information won\'t be updated. Please reload page.',
              type: 'is-warning',
            });
            dispatch('errors/emitError', error, {root: true});
          });
      }
    },
    updateTokenPrices({ state, commit }) {
      if (state.activeTokens.length === 0) return;

      const symbols = state.activeTokens.map(token => token.symbol);

      return price
        .getPrices(symbols.toString(), 'ETH')
        .then(resp => commit('setTokenPrices', resp));
    },
    updateTokenPrice({ commit }, symbol) {
      return price.getPrice(symbol, 'ETH').then(resp => {
        commit('setTokenPrice', symbol, resp);
      });
    },
    subsctibeOnTokenPriceUpdates({ dispatch }) {
      setInterval(() => {
        dispatch('updateTokenPrices');
      }, subscribtionsAPIInterval);
    },
    createTokenSubscription({ state, commit, rootState }, nonZerotokens) {
      const address = rootState.accounts.activeAccount.getAddressString();
      //remove repetitive tokens
      const filteredSavedTokensTokens = state.savedTokens.filter(
        savedToken =>
          !nonZerotokens.find(
            nonZeroToken =>
              nonZeroToken.tokenInfo.address === savedToken.address
          )
      );

      const tokensToWatch = filteredSavedTokensTokens.concat(
        nonZerotokens.map(nonZeroToken => ({
          address: nonZeroToken.tokenInfo.address,
        }))
      );

      const subscription = new TokenTracker({
        userAddress: address,
        provider: rootState.web3.web3.currentProvider,
        pollingInterval: 4000,
        tokens: tokensToWatch,
      });

      const interval = setInterval(() => {
        if (state.tokensSubscription) {
          const balances = state.tokensSubscription.serialize();
          // TODO check for errors here
          if (balances.length && typeof balances[0].symbol !== 'undefined')
            commit('saveTokens', balances);
        }
      }, 4000);
      commit('saveInterval', interval);
      commit('saveSubscription', subscription);
    },
    getNonZeroTokens({ rootState }) {
      const address = rootState.accounts.activeAccount.getAddressString();
      return EthplorerService.getTransactions(address);
    },
    init({ commit, dispatch }) {
      return storage
        .read('eth.mainnet.tokens.saved')
        .then(tokens => commit('saveTokensFromStorage', tokens || []))
        .catch(e => dispatch('errors/emitError', e, {root: true}));
    },
  },
};
