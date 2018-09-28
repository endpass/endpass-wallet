import { IDENTITY_MODE } from '@/constants';

const isLoggedIn = state => !!state.email;

const isLoggedOut = state =>
  !state.authorizationStatus &&
  state.authorizationStatus !== state.prevAuthorizationStatus;

const isCustomIdentity = state => state.identityType === IDENTITY_MODE.CUSTOM;

const isDefaultIdentity = state => state.identityType === IDENTITY_MODE.DEFAULT;

export default {
  isLoggedIn,
  isLoggedOut,
  isCustomIdentity,
  isDefaultIdentity,
};
