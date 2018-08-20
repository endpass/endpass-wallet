import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  // tokens which's balances and prices are tracked
  trackedTokens: [],
  //all saved tokens by networks
  savedTokens: {},
  //tokens prices by symbol
  prices: {},
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
