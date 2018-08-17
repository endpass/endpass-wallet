import actions from '@/store/tokens/actions';
import { SAVE_TOKEN } from '@/store/tokens/mutations-types';
import { NotificationError } from '@/class';

jest.mock('@/services/user', () => require('../../__mocks__/services/user'));

describe('tokens actions', () => {
  describe('saveTokenAndSubscribe', () => {
    it('should try to save token with service and SAVE_TOKEN ', () => {
      const commit = jest.fn();
      const token = {
        address: '0x0',
        symbol: 'KEK-TOKEN',
      };
      const store = {};
      actions.saveToken({ commit, state }, token);
      expect(servicesMock.userService.setSetting).toHaveBeenCalledTimes(1);
      expect(servicesMock.userService.setSetting).toHaveBeenCalledWith(
        'tokens',
        state.saveTokens,
      );
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SAVE_TOKEN, token);
    });

    it('should emit error and dont change state if failed to fetch data', () => {
      const commit = jest.fn();
      const token = {
        address: '0x0',
        symbol: 'KEK-TOKEN',
      };
      const store = {};
      actions.saveToken({ commit, state }, token);
      expect(servicesMock.userService.setSetting).toHaveBeenCalledTimes(1);
      expect(servicesMock.userService.setSetting).toHaveBeenCalledWith(
        'tokens',
        state.saveTokens,
      );
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SAVE_TOKEN, token);
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
