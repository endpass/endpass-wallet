import { mapKeys, mapValues, pickBy } from 'lodash';
import { userService, authService, identityModeService } from '@/services';
import { NotificationError, Token } from '@/class';
import { IDENTITY_MODE } from '@/constants';
import {
  SET_AUTHORIZATION_STATUS,
  SET_IDENTITY_TYPE,
  SET_EMAIL,
  SET_SETTINGS,
  SET_OTP_SETTINGS,
} from './mutations-types';
import { SET_USER_TOKENS } from '@/store/tokens/mutations-types';

const setAuthorizationStatus = (
  { commit, getters },
  { authorizationStatus },
) => {
  commit(SET_AUTHORIZATION_STATUS, authorizationStatus);

  if (getters.isLoggedOut) {
    /* eslint-disable-next-line */
    const notificationError = new NotificationError({
      title: 'Auth error',
      text:
        'You are not an authorized user. In order to continue using the wallet, please log in.',
      type: 'is-danger',
    });

    // dispatch('errors/emitError', notificationError, { root: true });
  }
};

const login = async (
  { commit, dispatch },
  { email, redirectUri, mode = {} },
) => {
  const { type = IDENTITY_MODE.DEFAULT, serverUrl } = mode;

  if (type === IDENTITY_MODE.DEFAULT) {
    return authService.login({ email, redirectUri });
  }

  try {
    identityModeService.setIdentityMode(type, serverUrl);
    commit(SET_IDENTITY_TYPE, type);
    commit(SET_AUTHORIZATION_STATUS, true);
    commit(SET_EMAIL, email);
    const settings = { email };

    await userService.setSettings(settings);

    return dispatch('init', null, { root: true });
  } catch (e) {
    return dispatch('errors/emitError', e, { root: true });
  }
};

const logout = async ({ commit, dispatch, getters }) => {
  commit(SET_EMAIL, null);

  try {
    if (getters.isLocalIdentity) {
      await identityModeService.deleteIdentityData();
    }

    try {
      identityModeService.setIdentityMode(IDENTITY_MODE.DEFAULT);
    } catch (e) {} // eslint-disable-line no-empty

    if (getters.isDefaultIdentity) {
      await authService.logout();
    }

    window.location.reload();
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const validateCustomServer = (ctx, { serverUrl }) =>
  identityModeService.validateIdentityServer(serverUrl);

const loginViaOTP = (ctx, { code, email }) =>
  authService.loginViaOTP(code, email);

const getOtpSettings = async ({ commit, dispatch }) => {
  try {
    const otpSettings = await userService.getOtpSettings();

    commit(SET_OTP_SETTINGS, otpSettings);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const setOtpSettings = async ({ commit }, { secret, code }) => {
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
    await userService.setSettings(settings);
  } catch (e) {
    dispatch('errors/emitError', e, { root: true });
  }
};

const setUserSettings = async ({ commit, dispatch }) => {
  try {
    const { fiatCurrency, email, tokens } = await userService.getSettings();

    if (email) {
      commit(SET_EMAIL, email);
    }

    if (fiatCurrency) {
      commit(SET_SETTINGS, { fiatCurrency });
    }

    if (tokens) {
      const normalizedTokens = mapValues(tokens, netTokens =>
        netTokens.map(token => Token.getConsistent(token)),
      );
      const mappedTokens = mapValues(normalizedTokens, netTokens =>
        mapKeys(netTokens, 'address'),
      );

      commit(`tokens/${SET_USER_TOKENS}`, mappedTokens, { root: true });
    }
  } catch (e) {
    await dispatch('errors/emitError', e, { root: true });
  }
};

const initIdentityMode = async ({ commit, dispatch }) => {
  try {
    const { type, serverUrl } = identityModeService.getIdentityMode();
    identityModeService.setIdentityMode(type, serverUrl);

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
  validateCustomServer,
  initIdentityMode,
  init,
};
