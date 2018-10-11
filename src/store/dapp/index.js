import actions from './actions';
import mutations from './mutations';
import getters from './getters';

export const state = {
  intied: false,
  queue: [],
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters,
};
