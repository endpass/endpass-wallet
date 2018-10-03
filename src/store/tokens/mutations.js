import Vue from 'vue';
import {
  SET_LOADING,
  ADD_NETWORK_TOKENS,
  SET_TOKENS_PRICES,
  SET_USER_TOKENS,
  SET_TOKENS_BY_ADDRESS,
  SET_BALANCES_BY_ADDRESS,
} from './mutations-types';

const addNetworkTokens = (state, tokens) => {
  Object.assign(state.networkTokens, tokens);
};

const setLoading = (state, isLoading) => {
  state.isLoading = isLoading;
};

const setTokensPrices = (state, prices) => {
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
  [SET_TOKENS_PRICES]: setTokensPrices,
  [SET_USER_TOKENS]: setUserTokens,
  [SET_TOKENS_BY_ADDRESS]: setTokensByAddress,
  [SET_BALANCES_BY_ADDRESS]: setBalancesByAddress,
};
