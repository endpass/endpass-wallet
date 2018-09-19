import mutations from '@/store/user/mutations';
import {
  SET_AUTHORIZATION_STATUS,
  SET_EMAIL,
  SET_SETTINGS,
  SET_OTP_SETTINGS,
} from '@/store/user/mutations-types';

describe('user mutations', () => {
  describe('setAuthorizationStatus', () => {
    it('should change authorization status', () => {
      const authorizationStatus = true;
      let state = {
        authorizationStatus: false,
        prevAuthorizationStatus: null,
      };

      mutations[SET_AUTHORIZATION_STATUS](state, authorizationStatus);

      expect(state).toEqual({
        authorizationStatus,
        prevAuthorizationStatus: false,
      });
    });
  });

  describe(SET_EMAIL, () => {
    it('should set email', () => {
      const state = { email: null };
      const email = 'email@email.com';

      mutations[SET_EMAIL](state, email);

      expect(state.email).toEqual(email);
    });
  });

  describe(SET_SETTINGS, () => {
    it('should set settings', () => {
      const state = { settings: { fiatCurrency: 'USD' } };
      const settings = { fiatCurrency: 'GBR' };

      mutations[SET_SETTINGS](state, settings);

      expect(state.settings).toEqual(settings);
    });
  });

  describe(SET_OTP_SETTINGS, () => {
    it('should set otp settings', () => {
      const state = { otpSettings: null };
      const newOptSettings = {};

      mutations[SET_OTP_SETTINGS](state, newOptSettings);

      expect(state.otpSettings).toEqual(newOptSettings);
    });
  });
});
