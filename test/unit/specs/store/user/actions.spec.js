import actions from '@/store/user/actions';
import {
  SET_AUTHORIZATION_STATUS,
  SET_IDENTITY_TYPE,
} from '@/store/user/mutations-types';
import { NotificationError } from '@/class';
import { userService } from '@/services';

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

  describe('initIdentityMode', () => {
    let dispatch;
    let commit;

    beforeEach(() => {
      userService.setIdentityMode = jest.fn();
      userService.setSettings = jest.fn();
      dispatch = jest.fn();
      commit = jest.fn();
    });

    it('should set the identity mode', async () => {
      expect.assertions(2);

      const type = 'custom';
      const serverUrl = 'url';
      const mode = { type, serverUrl };
      userService.getIdentityMode = jest.fn().mockReturnValueOnce(mode);

      await actions.initIdentityMode({ commit, dispatch });

      expect(userService.setIdentityMode).toHaveBeenCalledTimes(1);
      expect(userService.setIdentityMode).toHaveBeenCalledWith(type, serverUrl);
    });

    it('should set the auth status when not default mode', async () => {
      expect.assertions(2);

      const type = 'custom';
      const mode = { type };
      userService.getIdentityMode = jest.fn().mockReturnValueOnce(mode);

      await actions.initIdentityMode({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(2, SET_AUTHORIZATION_STATUS, true);
    });

    it('should not set the auth status when default mode', async () => {
      expect.assertions(1);

      const type = 'default';
      const mode = { type };
      userService.getIdentityMode = jest.fn().mockReturnValueOnce(mode);

      await actions.initIdentityMode({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(0);
    });

    it('should set the user identity type when default mode', async () => {
      expect.assertions(2);

      const type = 'custom';
      userService.getIdentityMode = jest.fn().mockReturnValueOnce({ type });

      await actions.initIdentityMode({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, SET_IDENTITY_TYPE, type);
    });

    it('should handle error', async () => {
      expect.assertions(2);

      const error = 'error';
      userService.getIdentityMode = jest.fn(() => {
        throw error;
      });

      await actions.initIdentityMode({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });
});
