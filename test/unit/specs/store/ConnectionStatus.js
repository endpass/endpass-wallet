import state from '@/store/connection-status/connection-status'
import testAction from '../ActionTestingHelper'

const commit = state => (type, payload) =>
  state.mutations[type](state, payload);

const dispatch = context => (type) => {
  state.actions[type](context);
}

describe('connection status store', () => {
  let stateInstance;
  beforeEach(() => {
    stateInstance = state.state;
  });
  it('set Web3 Connection Status', () => {
    state.mutations.setWeb3ConnectionStatus(stateInstance, false);
    expect(stateInstance.web3ConnectionStatus).toBe(false);
  });
  it('set Api Connection Status', () => {
    state.mutations.setApiConnectionStatus(stateInstance, false);
    expect(stateInstance.apiConnectionStatus).toBe(false);
  });
  it('set Sync Status', () => {
    state.mutations.setSyncStatus(stateInstance, false);
    expect(stateInstance.syncStatus).toBe(false);
  });
  it('adds Api Error Id', () => {
    state.mutations.addApiErrorId(stateInstance, 1);
    state.mutations.addApiErrorId(stateInstance, 1);
    expect(stateInstance.apiErrorsArray.length).toBe(1);
    expect(stateInstance.apiErrorsArray[0]).toBe(1);
  });
  it('removes Api Error Id', () => {
    state.mutations.addApiErrorId(stateInstance, 1);
    state.mutations.removeApiErrorId(stateInstance, 1);
    expect(stateInstance.apiErrorsArray.length).toBe(0);
  });
  it('should subscribe on sync status', done => {
    let eth = {
      isSyncing: () => {
        return new Promise((res, rej) => {
          res(1);
        });
      },
    };
    let contextMock = {
      state: {
        rootState: {
          web3: {
            currentProvider: 0,
            eth,
          },
        }
      },
      commit: () => {},
      dispatch: () => {},
    };
    const spyIsSyncing = jest.spyOn(eth, 'isSyncing');
    store.actions.subscribeOnSyncStatus(contextMock);
    expect(spyIsSyncing).toHaveBeenCalled();
    done();
  });
});
