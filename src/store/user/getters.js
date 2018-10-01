import { IDENTITY_MODE } from '@/constants';

const isLoggedIn = state => !!state.authorizationStatus;

const isLoggedOut = state =>
  !state.authorizationStatus &&
  state.authorizationStatus !== state.prevAuthorizationStatus;

const isCustomIdentity = state => state.identityType === IDENTITY_MODE.CUSTOM;

const isDefaultIdentity = state => state.identityType === IDENTITY_MODE.DEFAULT;

const isLocalIdentity = state => state.identityType === IDENTITY_MODE.LOCAL;

export default {
  isLoggedIn,
  isLoggedOut,
  isCustomIdentity,
  isDefaultIdentity,
  isLocalIdentity,
};
