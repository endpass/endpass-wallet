import getters from '@/store/user/getters';

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
});
