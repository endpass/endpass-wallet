import getters from '@/store/user/getters';
import { IDENTITY_MODE } from '@/constants';

describe('user getters', () => {
  describe('isLoggedIn', () => {
    it('should return false when not login', () => {
      const state = { email: null };

      expect(getters.isLoggedIn(state)).toBeFalsy();
    });

    it('should return true when login', () => {
      const state = { email: 'email@email.com' };

      expect(getters.isLoggedIn(state)).toBeTruthy();
    });
  });

  describe('isLoggedOut', () => {
    it('should return false', () => {
      let state = {
        authorizationStatus: true,
      };

      expect(getters.isLoggedOut(state)).toBeFalsy();

      state = {
        authorizationStatus: false,
        prevAuthorizationStatus: false,
      };

      expect(getters.isLoggedOut(state)).toBeFalsy();
    });

    it('should return true', () => {
      let state = {
        authorizationStatus: false,
      };

      expect(getters.isLoggedOut(state)).toBeTruthy();
    });
  });

  describe('isCustomIdentity', () => {
    it('should return false', () => {
      const state = {
        identityType: IDENTITY_MODE.DEFAULT,
      };

      expect(getters.isCustomIdentity(state)).toBeFalsy();
    });

    it('should return true', () => {
      const state = {
        identityType: IDENTITY_MODE.CUSTOM,
      };

      expect(getters.isCustomIdentity(state)).toBeTruthy();
    });
  });

  describe('isDefaultIdentity', () => {
    it('should return false', () => {
      const state = {
        identityType: IDENTITY_MODE.CUSTOM,
      };

      expect(getters.isDefaultIdentity(state)).toBeFalsy();
    });

    it('should return true', () => {
      const state = {
        identityType: IDENTITY_MODE.DEFAULT,
      };

      expect(getters.isDefaultIdentity(state)).toBeTruthy();
    });
  });
});
