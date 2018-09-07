import { SET_AUTHORIZATION_STATUS } from './mutations-types';

const setAuthorizationStatus = (state, authorizationStatus) => {
  state.prevAuthorizationStatus = state.authorizationStatus;
  state.authorizationStatus = authorizationStatus;
};

export default {
  [SET_AUTHORIZATION_STATUS]: setAuthorizationStatus,
};
