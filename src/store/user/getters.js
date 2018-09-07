const isLoggedOut = state =>
  !state.authorizationStatus &&
  state.authorizationStatus !== state.prevAuthorizationStatus;

export default {
  isLoggedOut,
};
