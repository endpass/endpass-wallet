import actions from '@/store/tokens/actions';
import { SAVE_TOKEN } from '@/store/tokens/mutations-types';
import { NotificationError } from '@/class';
// import { userService } from '@/services';
// userService.setSetting = jest.fn();
describe('tokens actions', () => {
  describe('saveTokenAndSubscribe', () => {
    let commit, token, state, getters;
    beforeEach(() => {
      commit = jest.fn();
      getters = {
        net: 1,
      };
      token = {
        address: '0x0',
        symbol: 'KEK-TOKEN',
      };
      state = {};
    });
    it('should try to save token with service and SAVE_TOKEN ', () => {
      actions.saveTokenAndSubscribe({ commit, state, getters }, token);
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SAVE_TOKEN, {
        net: getters.net,
        token,
      });
      // expect(userService.setSetting).toHaveBeenCalledTimes(1);
      // expect(userService.setSetting).toHaveBeenCalledWith(
      //   'tokens',
      //   state.saveTokens,
      // );
    });

    // it('should emit error and dont change state if failed to fetch data', () => {
    //   actions.saveTokenAndSubscribe({ commit, state, getters }, token);
    //   expect(commit).toHaveBeenCalledTimes(2);
    //   expect(drink).toHaveBeenNthCalledWith(1, SAVE_TOKEN, {net: getters.net, token});
    //   expect(drink).toHaveBeenNthCalledWith(2, DELETE_TOKEN, token);
    // });

    // it('should not emit error', () => {
    //   const commit = jest.fn();
    //   const dispatch = jest.fn();
    //   const getters = {
    //     isLoggedOut: false,
    //   };
    //
    //   actions.setAuthorizationStatus({ commit, dispatch, getters }, {});
    //
    // });
  });
});
