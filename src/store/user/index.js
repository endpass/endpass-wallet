import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  prevAuthorizationStatus: null,
  authorizationStatus: null,
  identityType: 'default',
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
