import Vue from 'vue';
import {
  SET_LOADING,
  SET_NETWORK_TOKENS,
  ADD_NETWORK_TOKENS,
  SET_TOKENS_PRICES,
  SET_USER_TOKENS,
  ADD_USER_TOKEN,
  REMOVE_USER_TOKEN,
  SET_TOKENS_BY_ADDRESS,
  SET_BALANCES_BY_ADDRESS,
} from './mutations-types';
import { mapArrayByProp } from '@/utils/arrays';

const setNetworkTokens = (state, tokens) => {
  state.networkTokens = mapArrayByProp(tokens, 'address');
};

const addNetworkTokens = (state, tokens) => {
  Vue.set(state, 'networkTokens', {
    ...state.networkTokens,
    ...tokens,
  });
};

const setLoading = (state, isLoading) => {
  state.isLoading = isLoading;
};

const setTokensPrices = (state, prices) => {
  Vue.set(state, 'prices', {
    ...state.prices,
    ...prices,
  });
};

const setUserTokens = (state, tokens) => {
  state.userTokens = tokens;
};

const addUserToken = (state, { token, net }) => {
  const targetNet = state.userTokens[net] || null;

  if (targetNet) {
    Vue.set(targetNet, token.address, token);
  } else {
    Vue.set(state.userTokens, net, {
      [token.address]: token,
    });
  }
};

const removeUserToken = (state, { token, net }) => {
  const targetNet = state.userTokens[net];

  if (targetNet) {
    Vue.delete(targetNet, token.address);
  }
};

const setTokensByAddress = (state, { address, tokens }) => {
  Vue.set(state.tokensByAddress, address, tokens);
};

const setBalancesByAddress = (state, { address, balances }) => {
  Vue.set(state.balancesByAddress, address, balances);
};

export default {
  SET_LOADING: setLoading,
  SET_NETWORK_TOKENS: setNetworkTokens,
  ADD_NETWORK_TOKENS: addNetworkTokens,
  SET_TOKENS_PRICES: setTokensPrices,
  SET_USER_TOKENS: setUserTokens,
  ADD_USER_TOKEN: addUserToken,
  REMOVE_USER_TOKEN: removeUserToken,
  SET_TOKENS_BY_ADDRESS: setTokensByAddress,
  SET_BALANCES_BY_ADDRESS: setBalancesByAddress,
};
