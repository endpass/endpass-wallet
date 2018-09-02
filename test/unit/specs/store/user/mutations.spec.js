import mutations from '@/store/user/mutations';
import {
  SET_AUTHORIZATION_STATUS,
  SET_IDENTITY_TYPE,
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

  describe(SET_IDENTITY_TYPE, () => {
    it('should set user idenity type', () => {
      const type = 'custom';
      const state = { identityType: 'default' };

      mutations[SET_IDENTITY_TYPE](state, type);

      expect(state.identityType).toBe(type);
    });
  });
});
