import Vue from 'vue';
import {
  SET_LOADING,
  ADD_NETWORK_TOKENS,
  SET_TOKENS_PRICES,
  SET_USER_TOKENS,
  SET_TOKENS_BY_ADDRESS,
  SET_BALANCES_BY_ADDRESS,
  SET_INTERVAL_ID,
} from './mutations-types';

const addNetworkTokens = (state, tokens) => {
  // FIXME: potentially slow part. Fix it when tokens will have common index
  Object.keys(tokens).forEach(key => {
    if (!state.networkTokens[key]) {
      Object.assign(state.networkTokens, {
        [key]: Object.freeze(tokens[key]), // Freeze tokens for perfomance reasons
      });
    }
  });
};

const setLoading = (state, isLoading) => {
  state.isLoading = isLoading;
};

const setTokensPrices = (state, prices) => {
  state.prices = {
    ...state.prices,
    ...prices,
  };
};

const setUserTokens = (state, tokens) => {
  state.userTokens = tokens;
};

const setTokensByAddress = (state, { address, tokens }) => {
  Vue.set(state.tokensByAddress, address, tokens);
};

const setBalancesByAddress = (state, { address, balances }) => {
  Vue.set(state.balancesByAddress, address, balances);
};

const setIntervalId = (state, id) => {
  clearInterval(state.intervalId);
  state.intervalId = id;
};

export default {
  [SET_INTERVAL_ID]: setIntervalId,
  [SET_LOADING]: setLoading,
  [ADD_NETWORK_TOKENS]: addNetworkTokens,
  [SET_TOKENS_PRICES]: setTokensPrices,
  [SET_USER_TOKENS]: setUserTokens,
  [SET_TOKENS_BY_ADDRESS]: setTokensByAddress,
  [SET_BALANCES_BY_ADDRESS]: setBalancesByAddress,
};
