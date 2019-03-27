import actions from '@/store/connection-status/actions';
import {
  SET_WEB3_CONNECTION_STATUS,
  SET_API_CONNECTION_STATUS,
  SET_SYNC_STATUS,
  ADD_API_ERROR_ID,
  REMOVE_API_ERROR_ID,
} from '@/store/connection-status/mutations-types';

jest.useFakeTimers();

describe('connection-status actions', () => {
  let commit; let dispatch; let state; let
    getters;
  describe('updateApiErrorStatus', () => {
    const payload = {
      id: 1,
      status: true,
    };
    beforeEach(() => {
      commit = jest.fn();
      dispatch = jest.fn();
      state = {
        apiErrorsArray: [],
      };
    });
    it('should add api error and set connections status', () => {
      actions.updateApiErrorStatus({ commit, dispatch }, payload);
      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, ADD_API_ERROR_ID, payload.id);
      expect(commit).toHaveBeenNthCalledWith(
        2,
        SET_API_CONNECTION_STATUS,
        payload.status,
      );
    });

    it('should remove api error id', () => {
      payload.status = false;
      actions.updateApiErrorStatus({ state, commit, dispatch }, payload);
      expect(commit).toHaveBeenNthCalledWith(
        1,
        REMOVE_API_ERROR_ID,
        payload.id,
      );
    });

    it('should set connection error status to false if last error removed', () => {
      payload.status = false;
      actions.updateApiErrorStatus({ state, commit, dispatch }, payload);
      expect(commit).toHaveBeenNthCalledWith(
        2,
        SET_API_CONNECTION_STATUS,
        payload.status,
      );
    });

    it("shouldn't change status if error left", () => {
      payload.status = false;
      state.apiErrorsArray = [2];
      actions.updateApiErrorStatus({ state, commit, dispatch }, payload);
      expect(commit).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeOnSyncStatus', () => {
    beforeEach(() => {
      commit = jest.fn();
      dispatch = jest.fn();
      getters = {
        eth: {
          isSyncing: jest.fn(),
        },
        currentProvider: 'kek',
      };
    });
    it('should set syncing status and web3 connection statuses and update subscribtion', async () => {
      getters.eth.isSyncing.mockResolvedValueOnce(false);
      await actions.subscribeOnSyncStatus({ commit, dispatch, getters });
      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, SET_SYNC_STATUS, false);
      expect(commit).toHaveBeenNthCalledWith(
        2,
        SET_WEB3_CONNECTION_STATUS,
        true,
      );
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        ENV.VUE_APP_BLOCK_UPDATE_INTERVAL,
      );
      jest.runAllTimers();
      expect(dispatch).toHaveBeenCalledWith('subscribeOnSyncStatus');
    });
    // impossible to test with async/await ?
    it("shouldn't set syncing status and web3 connection statuses if provider have changed and update subscribtion", (done) => {
      getters.eth.isSyncing.mockResolvedValueOnce(false);
      actions.subscribeOnSyncStatus({ commit, dispatch, getters }).then(() => {
        expect(commit).toHaveBeenCalledTimes(0);
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(
          expect.any(Function),
          ENV.VUE_APP_BLOCK_UPDATE_INTERVAL,
        );
        jest.runAllTimers();
        expect(dispatch).toHaveBeenCalledWith('subscribeOnSyncStatus');
        done();
      });
      getters.currentProvider = 'chpok';
    });
    it('should update web3 status, throw error and update subscribtion is isSyncing rejected', async () => {
      const err = 'kek';
      getters.eth.isSyncing.mockRejectedValueOnce(err);
      await actions.subscribeOnSyncStatus({ commit, dispatch, getters });
      jest.runAllTimers();
      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(SET_WEB3_CONNECTION_STATUS, false);
      expect(setTimeout).toHaveBeenLastCalledWith(
        expect.any(Function),
        ENV.VUE_APP_BLOCK_UPDATE_INTERVAL,
      );
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'errors/emitError', err, {
        root: true,
      });
      expect(dispatch).toHaveBeenLastCalledWith('subscribeOnSyncStatus');
    });
  });
  describe('init', () => {
    beforeEach(() => {
      dispatch = jest.fn();
    });
    it('should subscribe on sync status updates', () => {
      actions.init({ dispatch });
      expect(dispatch).toHaveBeenCalledWith('subscribeOnSyncStatus');
    });
  });
});
