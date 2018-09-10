import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import { IDENTITY_MODE } from '@/constants';

const state = {
  prevAuthorizationStatus: null,
  authorizationStatus: null,
  identityType: IDENTITY_MODE.DEFAULT,
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
