import { SET_AUTHORIZATION_STATUS, SET_IDENTITY_TYPE } from './mutations-types';
import { IDENTITY_MODE } from '@/constants';

const setAuthorizationStatus = (state, authorizationStatus) => {
  state.prevAuthorizationStatus = state.authorizationStatus;
  state.authorizationStatus = authorizationStatus;
};

const setIdentityType = (state, type = IDENTITY_MODE.DEFAULT) => {
  state.identityType = type;
};

export default {
  [SET_AUTHORIZATION_STATUS]: setAuthorizationStatus,
  [SET_IDENTITY_TYPE]: setIdentityType,
};
