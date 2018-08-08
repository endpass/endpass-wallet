import mutations from '@/store/user/mutations';
import { SET_AUTHORIZATION_STATUS } from '@/store/user/mutations-types';

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
});
