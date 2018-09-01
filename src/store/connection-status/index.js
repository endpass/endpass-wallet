import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  //web3 provider state
  web3Connection: true,
  //external api's state
  apiConnection: true,
  //is node syncing
  isSyncing: true,
  //external api errors for multiple api tracking
  apiErrorsArray: [],
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
