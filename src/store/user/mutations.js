import {
  SET_AUTHORIZATION_STATUS,
  SET_EMAIL,
  SET_SETTINGS,
  SET_OTP_SETTINGS,
} from './mutations-types';

const setAuthorizationStatus = (state, authorizationStatus) => {
  state.prevAuthorizationStatus = state.authorizationStatus;
  state.authorizationStatus = authorizationStatus;
};

const setEmail = (state, email) => {
  state.email = email;
};

const setSettings = (state, settings) => {
  state.settings = JSON.parse(JSON.stringify(settings));
};

const setOtpSettings = (state, otpSettings) => {
  state.otpSettings = otpSettings;
};

export default {
  [SET_AUTHORIZATION_STATUS]: setAuthorizationStatus,
  [SET_EMAIL]: setEmail,
  [SET_SETTINGS]: setSettings,
  [SET_OTP_SETTINGS]: setOtpSettings,
};
