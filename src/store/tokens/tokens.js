import TokenTracker from 'eth-token-tracker';
import { Token } from '@/class';
import { endpassService, ethplorerService } from '@/services';
import price from '@/services/price';
import storage from '@/services/storage';
import { subscriptionsAPIInterval } from '@/config';
import { NotificationError } from '@/class';

export default {
  namespaced: true,
  state() {
    return {
      // tokens from subscribtipn
      activeTokens: [],
      //tokens from localStorage
      savedTokens: {},
      prices: {},
      tokensSubscription: null,
      tokensSerializeInterval: null,
    };
  },
  getters: {
    net(state, getters, rootState) {
      return rootState.web3.activeNet.id;
    },
    savedActiveTokens(state, { net }) {
      return state.savedTokens[net] || [];
    },
    // Returns the most recent price in ETH of the token with the given
    // symbol
    tokenEthPrice: state => symbol => {
      let price = state.prices[symbol.toUpperCase()];
      return price ? price['ETH'] : null;
    },
  },
  mutations: {
    addToken({ savedTokens }, { token, net }) {
      savedTokens[net] = savedTokens[net] || [];
      savedTokens[net].push(new Token(token));
    },
    removeToken(
      { tokensSubscription, savedTokens, activeTokens },
      { token, net },
    ) {
      const tokenActiveIdx = activeTokens.findIndex(
        tkn => tkn.address === token.address,
      );

      if (tokenActiveIdx !== -1) {
        activeTokens.splice(tokenActiveIdx, 1);
      }

      const { tokens } = tokensSubscription;
      const tokenIdx = tokens.findIndex(tkn => tkn.address === token.address);

      if (tokenIdx !== -1) {
        tokens.splice(tokenIdx, 1);
      }

      const tokenSavedIdx = savedTokens[net].findIndex(
        tkn => tkn.address === token.address,
      );

      if (tokenSavedIdx !== -1) {
        savedTokens[net].splice(tokenIdx, 1);
      }
    },
    saveTokens(state, tokens = {}) {
      state.savedTokens = tokens;
    },
    saveActiveTokens(state, tokens = []) {
      // TODO check for errors here, activeTokens is undefined
      state.activeTokens = tokens.map(token => new Token(token));
    },
    setTokenPrices(state, prices) {
      state.prices = prices;
    },
    setTokenPrice(state, symbol, price) {
      state.prices[symbol] = price;
    },
    saveInterval(state, interval) {
      state.tokensSerializeInterval = interval;
    },
    saveSubscription(state, subscription) {
      state.tokensSubscription = subscription;
    },
  },
  actions: {
    addTokenToSubscription({ state, commit, dispatch, rootState }, token) {
      // Save token without blance for furer seances
      const tokenExist = state.tokensSubscription.tokens.find(
        subscriptionToken => subscriptionToken.address === token.address,
      );

      if (!tokenExist) {
        commit('addToken', {
          token,
          net: rootState.web3.activeNet.id,
        });
        storage
          .write('tokens', state.savedTokens)
          .catch(e => dispatch('errors/emitError', e, { root: true }));
        state.tokensSubscription.add({ ...token });
      }
    },
    getAllTokens({ dispatch, getters }) {
      if (getters.net !== 1) {
        return [];
      }

      return endpassService
        .getTokensList()
        .then(({ data }) => data)
        .catch(() => {
          const error = new NotificationError({
            title: 'Failed to get list of tokens',
            text:
              'An error occurred while retrieving the list of tokens. Please try again.',
            type: 'is-warning',
          });
          dispatch('errors/emitError', error, { root: true });

          return [];
        });
    },
    removeTokenFromSubscription({ commit, getters, state, dispatch }, token) {
      const { net } = getters;

      commit('removeToken', { token, net });

      return storage
        .write('tokens', state.savedTokens)
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
    subscribeOnTokenUpdates({ dispatch, state, rootState }) {
      // destroy old subscription and recreate new one (in case of address/provider change)
      if (!rootState.accounts.address) {
        return Promise.resolve();
      }

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
          const error = new NotificationError({
            title: 'Failed token subscription',
            text: "Token information won't be updated. Please reload page.",
            type: 'is-warning',
          });
          dispatch('errors/emitError', error, { root: true });
        });
    },
    updateTokenPrices({ state, commit, rootState }) {
      if (state.activeTokens.length === 0) return;

      const symbols = state.activeTokens.map(token => token.symbol);

      return price
        .getPrices(symbols, rootState.web3.activeCurrency.name)
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
      }, subscriptionsAPIInterval);
    },
    createTokenSubscription(
      { state, commit, getters, rootState },
      nonZeroTokens,
    ) {
      commit('saveActiveTokens', []);

      const address = rootState.accounts.address.getChecksumAddressString();
      //remove repetitive tokens
      const filteredSavedTokens = getters.savedActiveTokens.filter(
        savedToken =>
          !nonZeroTokens.find(
            nonZeroToken =>
              nonZeroToken.tokenInfo.address === savedToken.address,
          ),
      );

      const tokensToWatch = filteredSavedTokens.concat(
        nonZeroTokens.map(nonZeroToken => ({
          address: nonZeroToken.tokenInfo.address,
        })),
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
            commit('saveActiveTokens', balances);
        }
      }, 4000);
      commit('saveInterval', interval);
      commit('saveSubscription', subscription);
    },
    getNonZeroTokens({ rootState, dispatch }) {
      const address = rootState.accounts.address.getChecksumAddressString();
      const promise = ethplorerService.getTransactions(address);
      promise
        .then(() => {
          dispatch(
            'connectionStatus/updateApiErrorStatus',
            {
              id: 'ethplorer',
              status: true,
            },
            { root: true },
          );
        })
        .catch(e => {
          e.apiError = {
            id: 'ethplorer',
            status: false,
          };
          dispatch('errors/emitError', e, { root: true });
        });
      return promise;
    },
    init({ commit, dispatch }) {
      return storage
        .read('tokens')
        .then(tokens => commit('saveTokens', tokens || {}))
        .catch(e => dispatch('errors/emitError', e, { root: true }));
    },
  },
};
