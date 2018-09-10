import { IDENTITY_MODE } from '@/constants';

const isLoggedOut = state =>
  !state.authorizationStatus &&
  state.authorizationStatus !== state.prevAuthorizationStatus;

const isCustomIdentity = state => state.identityType === IDENTITY_MODE.CUSTOM;

const isDefaultIdentity = state => state.identityType === IDENTITY_MODE.DEFAULT;

export default {
  isCustomIdentity,
  isDefaultIdentity,
  isLoggedOut,
};
