import { userService } from '@/services';
import actions from '@/store/user/actions';
import {
  SET_AUTHORIZATION_STATUS,
  SET_SETTINGS,
  SET_OTP_SETTINGS,
  SET_EMAIL,
} from '@/store/user/mutations-types';
import {
  SAVE_TOKENS,
  SAVE_TRACKED_TOKENS,
} from '@/store/tokens/mutations-types';
import { NotificationError } from '@/class';

describe('user actions', () => {
  let commit;
  let dispatch;
  const email = 'email@email.com';

  beforeEach(() => {
    commit = jest.fn();
    dispatch = jest.fn();
    userService.setSetting = jest.fn();
  });

  describe('setAuthorizationStatus', () => {
    it('should call SET_AUTHORIZATION_STATUS mutation', () => {
      const commit = jest.fn();
      const getters = {};
      const authorizationStatus = true;

      actions.setAuthorizationStatus(
        { commit, getters },
        { authorizationStatus },
      );

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        SET_AUTHORIZATION_STATUS,
        authorizationStatus,
      );
    });

    it('should not emit error', () => {
      const commit = jest.fn();
      const dispatch = jest.fn();
      const getters = {
        isLoggedOut: false,
      };

      actions.setAuthorizationStatus({ commit, dispatch, getters }, {});

      expect(dispatch).toHaveBeenCalledTimes(0);
    });
  });

  describe('login', () => {
    userService.login = jest.fn();

    it('should login through the user service', async () => {
      expect.assertions(2);

      const params = { email, redirectUri: '/uri' };

      await actions.login({ commit, dispatch }, params);

      expect(userService.login).toHaveBeenCalledTimes(1);
      expect(userService.login).toBeCalledWith(params);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      userService.logout = jest.fn();
    });

    it('should reset the email', async () => {
      expect.assertions(2);

      await actions.logout({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_EMAIL, null);
    });

    it('should logout through the user service', async () => {
      expect.assertions(2);

      await actions.logout({ commit, dispatch });

      expect(userService.logout).toHaveBeenCalledTimes(1);
      expect(userService.logout).toBeCalledWith();
    });

    it('should reload the page', async () => {
      expect.assertions(2);

      const spy = jest.spyOn(window.location, 'reload');

      await actions.logout({ commit, dispatch });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toBeCalledWith();

      spy.mockRestore();
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.logout.mockRejectedValueOnce(error);

      await actions.logout({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('loginViaOTP', () => {
    const code = '123';
    userService.loginViaOTP = jest.fn();

    it('should otp login through the user service', async () => {
      expect.assertions(2);

      await actions.loginViaOTP({ commit, dispatch }, { email, code });

      expect(userService.loginViaOTP).toHaveBeenCalledTimes(1);
      expect(userService.loginViaOTP).toBeCalledWith(code, email);
    });
  });

  describe('getOtpSettings', () => {
    const otpSettings = { otp: true };
    userService.getOtpSettings = jest.fn().mockResolvedValue(otpSettings);

    it('should get the otp settings through the user service', async () => {
      expect.assertions(2);

      await actions.getOtpSettings({ commit, dispatch });

      expect(userService.getOtpSettings).toHaveBeenCalledTimes(1);
      expect(userService.getOtpSettings).toBeCalledWith();
    });

    it('should set the otp settings to store', async () => {
      expect.assertions(2);

      await actions.getOtpSettings({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_OTP_SETTINGS, otpSettings);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.getOtpSettings.mockRejectedValueOnce(error);

      await actions.getOtpSettings({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('setOtpSettings', () => {
    const secret = 'secret';
    const code = 'code';
    const otpSettings = { secret, code };
    userService.setOtpSettings = jest.fn();

    it('should save the otp settings through the user service', async () => {
      expect.assertions(2);

      await actions.setOtpSettings({ commit, dispatch }, otpSettings);

      expect(userService.setOtpSettings).toHaveBeenCalledTimes(1);
      expect(userService.setOtpSettings).toBeCalledWith(secret, code);
    });

    it('should enable the otp settings in the store', async () => {
      expect.assertions(2);

      await actions.setOtpSettings({ commit, dispatch }, otpSettings);

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_OTP_SETTINGS, { status: 'enabled' });
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.setOtpSettings.mockRejectedValueOnce(error);

      await actions.setOtpSettings({ commit, dispatch }, otpSettings);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('deleteOtpSettings', () => {
    const otpSettings = { code: 'code' };
    userService.deleteOtpSettings = jest.fn();

    it('should delete the otp settings through the user service', async () => {
      expect.assertions(2);

      await actions.deleteOtpSettings({ commit, dispatch }, otpSettings);

      expect(userService.deleteOtpSettings).toHaveBeenCalledTimes(1);
      expect(userService.deleteOtpSettings).toBeCalledWith(otpSettings.code);
    });

    it('should reset the otp settings in the store', async () => {
      expect.assertions(2);

      await actions.deleteOtpSettings({ commit, dispatch }, otpSettings);

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_OTP_SETTINGS, {});
    });

    it('should get the otp settings through the user service', async () => {
      expect.assertions(2);

      await actions.deleteOtpSettings({ commit, dispatch }, otpSettings);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('getOtpSettings');
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.deleteOtpSettings.mockRejectedValueOnce(error);

      await actions.deleteOtpSettings({ commit, dispatch }, otpSettings);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('updateSettings', () => {
    const settings = { user: 'settings' };

    it('should set the settings', async () => {
      expect.assertions(2);

      await actions.updateSettings({ commit, dispatch }, settings);

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_SETTINGS, settings);
    });

    it('should save the settings through the user service', async () => {
      expect.assertions(2);

      await actions.updateSettings({ commit, dispatch }, settings);

      expect(userService.setSetting).toHaveBeenCalledTimes(1);
      expect(userService.setSetting).toBeCalledWith('settings', settings);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.setSetting.mockRejectedValueOnce(error);

      await actions.updateSettings({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('setUserSettings', () => {
    const settings = { setting: 'setting' };
    const tokens = [{ address: 'address1' }, { address: 'address2' }];
    userService.getSettings = jest
      .fn()
      .mockResolvedValue({ settings, tokens, email });

    it('should set the user email to the store', async () => {
      expect.assertions(2);

      await actions.setUserSettings({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(4);
      expect(commit).toHaveBeenNthCalledWith(1, SET_EMAIL, email);
    });

    it('should set the user settings to the store', async () => {
      expect.assertions(2);

      await actions.setUserSettings({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(4);
      expect(commit).toHaveBeenNthCalledWith(2, SET_SETTINGS, settings);
    });

    it('should set the tokens to the store', async () => {
      expect.assertions(2);

      await actions.setUserSettings({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(4);
      expect(commit).toHaveBeenNthCalledWith(
        3,
        `tokens/${SAVE_TOKENS}`,
        tokens,
        {
          root: true,
        },
      );
    });

    it('should set the tracked tokens to the store', async () => {
      expect.assertions(2);

      const tokenAddrs = tokens.map(({ address }) => address);

      await actions.setUserSettings({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(4);
      expect(commit).toHaveBeenNthCalledWith(
        4,
        `tokens/${SAVE_TRACKED_TOKENS}`,
        tokenAddrs,
        { root: true },
      );
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.getSettings.mockRejectedValueOnce(error);

      await actions.setUserSettings({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('init', () => {
    it('should set the user settings to the store', async () => {
      expect.assertions(2);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('setUserSettings');
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      dispatch.mockRejectedValueOnce(error);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });
});
