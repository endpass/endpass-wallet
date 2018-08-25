import actions from './actions';
import mutations from './mutations';

const state = {
  errorEmitter: null,
};

export default {
  namespaced: true,
  state,
  actions,
  mutations,
};
