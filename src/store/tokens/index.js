import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  // tokens which's balances and prices are tracked null untill first responce is fetched
  trackedTokens: null,
  //all saved tokens by networks
  savedTokens: {},
  //tokens prices by symbol
  prices: {},
  // Info about all tokens, by checksum address
  allTokens: {}, //IMMUTABLE
  tokenTracker: null,
  tokensSerializeInterval: null,
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
