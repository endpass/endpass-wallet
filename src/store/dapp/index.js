import actions from './actions';
import mutations from './mutations';
import getters from './getters';

export const state = {
  injected: false,
  messages: {},
  list: [],
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
};
