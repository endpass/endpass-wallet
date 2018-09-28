import { userService } from '@/services';
import { NotificationError } from '@/class';
import { IDENTITY_MODE } from '@/constants';
import {
  SET_AUTHORIZATION_STATUS,
  SET_IDENTITY_TYPE,
  SET_EMAIL,
  SET_SETTINGS,
  SET_OTP_SETTINGS,
} from './mutations-types';
import {
  SAVE_TOKENS,
  SAVE_TRACKED_TOKENS,
} from '@/store/tokens/mutations-types';

const setAuthorizationStatus = (
  { commit, getters },
  { authorizationStatus },
) => {
  commit(SET_AUTHORIZATION_STATUS, authorizationStatus);

  if (getters.isLoggedOut) {
    const notificationError = new NotificationError({
      title: 'Auth error',
      text:
        'You are not an authorized user. In order to continue using the wallet, please log in.',
      type: 'is-danger',
    });

    //dispatch('errors/emitError', notificationError, { root: true });
  }
};

const login = async (
  { commit, dispatch },
  { email, redirectUri, mode = {} },
) => {
  const { type = IDENTITY_MODE.DEFAULT, serverUrl } = mode;

  if (type === IDENTITY_MODE.DEFAULT) {
    return userService.login({ email, redirectUri });
  }

  try {
    userService.setIdentityMode(type, serverUrl);
    commit(SET_IDENTITY_TYPE, type);
    commit(SET_AUTHORIZATION_STATUS, true);
    commit(SET_EMAIL, email);
    await userService.setSettings({ email });

    return dispatch('init', null, { root: true });
  } catch (e) {
    return dispatch('errors/emitError', e, { root: true });
  }
};

const logout = async ({ commit, dispatch }) => {
  commit(SET_EMAIL, null);

  try {
    userService.setIdentityMode(IDENTITY_MODE.DEFAULT);
  } catch (e) {} // eslint-disable-line no-empty

  try {
    await userService.logout();
    window.location.reload();
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const loginViaOTP = (ctx, { code, email }) =>
  userService.loginViaOTP(code, email);

const getOtpSettings = async ({ commit, dispatch }) => {
  try {
    const otpSettings = await userService.getOtpSettings();
    commit(SET_OTP_SETTINGS, otpSettings);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const setOtpSettings = async ({ commit, dispatch }, { secret, code }) => {
  await userService.setOtpSettings(secret, code);
  commit(SET_OTP_SETTINGS, { status: 'enabled' });
};

const deleteOtpSettings = async ({ commit, dispatch }, { code }) => {
  await userService.deleteOtpSettings(code);
  commit(SET_OTP_SETTINGS, {});
  await dispatch('getOtpSettings');
};

const updateSettings = async ({ commit, dispatch }, settings) => {
  try {
    commit(SET_SETTINGS, settings);
    await userService.setSetting('settings', settings);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const setUserSettings = async ({ commit, dispatch }) => {
  try {
    const { settings, email, tokens } = await userService.getSettings();

    if (email) {
      commit(SET_EMAIL, email);
    }

    if (settings) {
      commit(SET_SETTINGS, settings);
    }

    if (tokens) {
      commit(`tokens/${SAVE_TOKENS}`, tokens, {
        root: true,
      });
      // Saved token contract addresses on all networks
      const tokenAddrs = []
        .concat(...Object.values(tokens))
        .map(token => token.address);
      commit(`tokens/${SAVE_TRACKED_TOKENS}`, tokenAddrs, { root: true });
    }
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

const initIdentityMode = async ({ commit, dispatch }) => {
  try {
    const { type, serverUrl } = userService.getIdentityMode();
    userService.setIdentityMode(type, serverUrl);

    if (type !== IDENTITY_MODE.DEFAULT) {
      commit(SET_IDENTITY_TYPE, type);
      commit(SET_AUTHORIZATION_STATUS, true);
    }
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

const init = async ({ dispatch }) => {
  try {
    await dispatch('setUserSettings');
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

export default {
  setAuthorizationStatus,
  updateSettings,
  login,
  logout,
  loginViaOTP,
  getOtpSettings,
  setOtpSettings,
  setUserSettings,
  deleteOtpSettings,
  initIdentityMode,
  init,
};
