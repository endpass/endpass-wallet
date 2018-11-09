import Vue from 'vue';
import {
  SET_LOADING,
  ADD_NETWORK_TOKENS,
  ADD_TOKENS_PRICES,
  SET_USER_TOKENS,
  SET_TOKENS_BY_ADDRESS,
  SET_BALANCES_BY_ADDRESS,
} from './mutations-types';

const addNetworkTokens = (state, tokens) => {
  // Freeze tokens for perfomance reasons
  Object.assign(state.networkTokens, Object.freeze(tokens));
};

const setLoading = (state, isLoading) => {
  state.isLoading = isLoading;
};

const addTokensPrices = (state, prices) => {
  Object.assign(state.prices, prices);
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

export default {
  [SET_LOADING]: setLoading,
  [ADD_NETWORK_TOKENS]: addNetworkTokens,
  [ADD_TOKENS_PRICES]: addTokensPrices,
  [SET_USER_TOKENS]: setUserTokens,
  [SET_TOKENS_BY_ADDRESS]: setTokensByAddress,
  [SET_BALANCES_BY_ADDRESS]: setBalancesByAddress,
};
