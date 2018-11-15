import { IDENTITY_MODE } from '@/constants';
import {
  SET_AUTHORIZATION_STATUS,
  SET_EMAIL,
  SET_SETTINGS,
  SET_OTP_SETTINGS,
  SET_IDENTITY_TYPE,
} from './mutations-types';

const setAuthorizationStatus = (state, authorizationStatus) => {
  state.prevAuthorizationStatus = state.authorizationStatus;
  state.authorizationStatus = authorizationStatus;
};

const setEmail = (state, email) => {
  state.email = email;
};

const setSettings = (state, settings) => {
  Object.assign(state.settings, settings);
};

const setOtpSettings = (state, otpSettings) => {
  state.otpSettings = otpSettings;
};

const setIdentityType = (state, type = IDENTITY_MODE.DEFAULT) => {
  state.identityType = type;
};

export default {
  [SET_AUTHORIZATION_STATUS]: setAuthorizationStatus,
  [SET_EMAIL]: setEmail,
  [SET_SETTINGS]: setSettings,
  [SET_OTP_SETTINGS]: setOtpSettings,
  [SET_IDENTITY_TYPE]: setIdentityType,
};
