import mutations from '@/store/connection-status/mutations';
import {
  SET_WEB3_CONNECTION_STATUS,
  SET_API_CONNECTION_STATUS,
  SET_SYNC_STATUS,
  ADD_API_ERROR_ID,
  REMOVE_API_ERROR_ID,
} from '@/store/connection-status/mutations-types';

describe('connection-status mutations', () => {
  let state;
  beforeEach(() => {
    state = {
      web3Connection: null,
      apiConnection: null,
      isSyncing: null,
      blockNumber: null,
      apiErrorsArray: [],
    };
  });
  it('should set web3 connection status', () => {
    mutations[SET_WEB3_CONNECTION_STATUS](state, false);
    expect(state.web3Connection).toBe(false);
  });

  it('should set api connection status', () => {
    mutations[SET_API_CONNECTION_STATUS](state, false);
    expect(state.apiConnection).toBe(false);
  });

  it('should set sync status', () => {
    mutations[SET_SYNC_STATUS](state, false);
    expect(state.isSyncing).toBe(false);
  });

  describe('add api error id', () => {
    it('should add api error id in list', () => {
      mutations[ADD_API_ERROR_ID](state, 1);
      expect(state.apiErrorsArray[0]).toBe(1);
    });

    it('should add api error id in list only once', () => {
      state.apiErrorsArray = [1];
      mutations[ADD_API_ERROR_ID](state, 1);
      expect(state.apiErrorsArray.length).toBe(1);
    });
  });

  it('should remove api error id from list', () => {
    state.apiErrorsArray = [1];
    mutations[REMOVE_API_ERROR_ID](state, 1);
    expect(state.apiErrorsArray.length).toBe(0);
  });
});
