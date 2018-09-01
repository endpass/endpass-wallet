import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  // All tokens we are tracking balances and prices for. Array of token
  // addresses
  // []string
  trackedTokens: [],
  // all saved tokens by networks
  savedTokens: {},
  //tokens prices by symbol
  prices: {},
  // Token balances by contract address
  balances: {},
  // Info about all tokens, by checksum address
  // {string: Token} - IMMUTABLE!
  allTokens: {},
  // True if anything is loading
  // Boolean
  isLoading: false,
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
