import getters from '@/store/user/getters';

describe('user getters', () => {
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
