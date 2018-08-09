import actions from '@/store/user/actions';
import { SET_AUTHORIZATION_STATUS } from '@/store/user/mutations-types';
import { NotificationError } from '@/class';

describe('user actions', () => {
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

    it('should emit error', () => {
      const commit = jest.fn();
      const dispatch = jest.fn();
      const getters = {
        isLoggedOut: true,
      };
      const notificationError = new NotificationError({
        title: 'Auth error',
        text:
          'You are not an authorized user. In order to continue using the wallet, please log in.',
        type: 'is-danger',
      });

      actions.setAuthorizationStatus({ commit, dispatch, getters }, {});

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(
        'errors/emitError',
        notificationError,
        { root: true },
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
});
