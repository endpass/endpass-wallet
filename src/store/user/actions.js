import { userService } from '@/services';
import { NotificationError } from '@/class';
import {
  SET_AUTHORIZATION_STATUS,
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

const login = (ctx, { email, redirectUri }) =>
  userService.login({ email, redirectUri });

const logout = async ({ commit, dispatch }) => {
  try {
    commit(SET_EMAIL, null);
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
  try {
    await userService.setOtpSettings(secret, code);
    commit(SET_OTP_SETTINGS, { status: 'enabled' });
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const deleteOtpSettings = async ({ commit, dispatch }, { code }) => {
  try {
    await userService.deleteOtpSettings(code);
    commit(SET_OTP_SETTINGS, {});
    await dispatch('getOtpSettings');
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
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
  init,
};
