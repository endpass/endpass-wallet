import Web3 from 'web3';

import store from '@/store/web3/web3';
import testAction from '../ActionTestingHelper';
import storage from '@/services/storage';

jest.mock('@/services/storage', () => ({
  write: jest.fn().mockResolvedValue(),
  read: jest.fn().mockResolvedValue(),
}));

jest.mock('@/services/user', () => require('../../__mocks__/services/user'));

const stateInstance = store.state();

describe('web3 store', () => {
  afterEach(() => {
    storage.write.mockClear();
  });

  it('should get full list of networks', () => {
    stateInstance.activeCurrency = null;
    let netList = store.getters.networks(stateInstance);
    expect(netList.length).toBe(4);
  });

  it('should change network', () => {
    store.mutations.changeNetwork(stateInstance, {
      name: 'TestNet',
      id: 4,
      url: 'https://testnet.infura.io/',
    });
    expect(stateInstance.activeNet.id).toBe(4);
  });

  it('should change currency', () => {
    store.mutations.changeCurrency(stateInstance, {
      name: 'ETH-TEST',
      id: 2,
    });
    expect(stateInstance.activeCurrency.id).toBe(2);
  });

  it('should filter networks with active net', () => {
    store.mutations.changeCurrency(stateInstance, {
      name: 'ETH-TEST',
      id: 2,
    });
    expect(store.getters.networks(stateInstance).length).toBe(2);
  });

  it('should change with action network', done => {
    testAction(
      store.actions.changeNetwork,
      3,
      {
        state: {
          accounts: {
            wallet: null,
          },
        },
        getters: {
          networks: [
            {
              id: 1,
            },
            {
              id: 2,
            },
            {
              id: 3,
            },
          ],
        },
      },
      [{ type: 'changeNetwork' }],
      [
        { type: 'fetchNetworkType' },
        { type: 'subscribeOnBlockUpdates' },
        { type: 'tokens/subscribeOnTokensBalancesUpdates' },
      ],
      done,
    );
  });

  it('should change with action currency', done => {
    testAction(
      store.actions.changeCurrency,
      3,
      {
        state: {
          activeNet: stateInstance.activeNet,
          currencies: stateInstance.currencies,
        },
        getters: {
          networks: [
            {
              id: 1,
            },
            {
              id: 2,
            },
            {
              id: 3,
            },
          ],
        },
      },
      [{ type: 'changeCurrency' }],
      [{ type: 'changeNetwork' }],
      done,
    );
  });

  describe('getters', () => {
    describe('isCustomNetwork', () => {
      const defaultNetworks = [{ id: 1 }, { id: 2 }];
      const { isCustomNetwork } = store.getters;

      it('should return true', () => {
        const network = { id: 5 };

        expect(isCustomNetwork({ defaultNetworks })(network)).toBeTruthy();
      });

      it('should return false', () => {
        let network = { id: -1 };

        expect(isCustomNetwork({ defaultNetworks })(network)).toBeFalsy();

        network = { id: 2 };

        expect(isCustomNetwork({ defaultNetworks })(network)).toBeFalsy();
      });
    });
  });

  describe('mutations', () => {
    describe('addNewProvider', () => {
      const { addNewProvider } = store.mutations;

      it('should update provider', () => {
        const storedNetworks = [
          {
            id: 1,
            name: 'name',
            url: 'url',
            currency: 1,
          },
        ];
        const network = {
          id: 1,
          name: 'new name',
          url: 'new url',
          currency: 2,
        };
        const expectedStoredNetworks = storedNetworks.concat(network);

        addNewProvider({ storedNetworks }, network);

        expect(storedNetworks).toEqual(expectedStoredNetworks);
      });
    });

    describe('updateProvider', () => {
      const { updateProvider } = store.mutations;

      it('should update provider', () => {
        const storedNetworks = [
          {
            id: 1,
            name: 'name',
            url: 'url',
            currency: 1,
          },
        ];
        const network = {
          id: 1,
          name: 'new name',
          url: 'new url',
          currency: 2,
        };

        updateProvider({ storedNetworks }, network);

        expect(storedNetworks).toEqual([network]);
      });

      it('should not update provider', () => {
        const storedNetworks = [
          {
            id: 1,
            name: 'name',
            url: 'url',
            currency: 1,
          },
        ];
        const network = {
          id: 2,
          name: 'new name',
          url: 'new url',
          currency: 2,
        };
        const expectedStoredNetworks = [
          {
            id: 1,
            name: 'name',
            url: 'url',
            currency: 1,
          },
        ];

        updateProvider({ storedNetworks }, network);

        expect(storedNetworks).toEqual(expectedStoredNetworks);
      });
    });

    describe('deleteProvider', () => {
      const { deleteProvider } = store.mutations;

      it('should delete provider', () => {
        const state = {
          storedNetworks: [{ id: 1 }],
        };
        const network = {
          id: 1,
        };

        deleteProvider(state, network);

        expect(state.storedNetworks).toEqual([]);
      });

      it('should not delete provider', () => {
        const state = {
          storedNetworks: [{ id: 1 }],
        };
        const expectedStoredNetworks = [{ id: 1 }];
        const network = {
          id: 2,
        };

        deleteProvider(state, network);

        expect(state.storedNetworks).toEqual(expectedStoredNetworks);
      });
    });
  });

  describe('actions', () => {
    describe('addNewProvider', () => {
      const { addNewProvider } = store.actions;
      const getters = {
        networks: [{ id: 1 }],
      };
      const state = {
        storedNetworks: {},
      };

      it('should call addNewProvider mutation', () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = {};
        const expectedNetwork = { id: 2 };

        addNewProvider({ commit, dispatch, getters, state }, { network });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit).toHaveBeenCalledWith('addNewProvider', network);
      });

      it('should save networks', async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = {};

        expect.assertions(2);

        await addNewProvider({ commit, dispatch, getters, state }, { network });

        expect(storage.write).toHaveBeenCalledTimes(1);
        expect(storage.write).toHaveBeenCalledWith(
          'networks',
          state.storedNetworks,
        );
      });

      it('should dispatch changeNetwork action', async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = {};

        expect.assertions(2);

        await addNewProvider({ commit, dispatch, getters, state }, { network });

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith('changeNetwork', network.id);
      });

      it('should handle the error of adding a new provider', async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = {};
        const error = new Error();

        expect.assertions(4);

        storage.write.mockRejectedValueOnce(error);

        await addNewProvider({ commit, dispatch, getters, state }, { network });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
          root: true,
        });

        dispatch.mockClear();
        dispatch.mockRejectedValueOnce(error);

        await addNewProvider({ commit, dispatch, getters, state }, { network });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
          root: true,
        });
      });
    });

    describe('updateProvider', () => {
      const { updateProvider } = store.actions;
      const state = {
        storedNetworks: {},
      };

      it('should call updateProvider mutation', () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = {};

        updateProvider({ commit, dispatch, state }, { network });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit).toHaveBeenCalledWith('updateProvider', network);
      });

      it('should update networks', async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = {};

        expect.assertions(2);

        await updateProvider({ commit, dispatch, state }, { network });

        expect(storage.write).toHaveBeenCalledTimes(1);
        expect(storage.write).toHaveBeenCalledWith(
          'networks',
          state.storedNetworks,
        );
      });

      it('should handle the provider update error', async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = {};
        const error = new Error();

        expect.assertions(2);

        storage.write.mockRejectedValueOnce(error);

        await updateProvider({ commit, dispatch, state }, { network });

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
          root: true,
        });
      });
    });

    describe('deleteProvider', () => {
      const { deleteProvider } = store.actions;
      const url = 'url';
      const state = {
        storedNetworks: {},
        activeNet: { url },
      };
      const getters = {
        networks: [{ id: 1 }],
      };

      it('should call deleteProvider mutation', () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = {};

        deleteProvider({ commit, dispatch, state, getters }, { network });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit).toHaveBeenCalledWith('deleteProvider', network);
      });

      it('should save networks', async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = {};

        expect.assertions(2);

        await deleteProvider({ commit, dispatch, getters, state }, { network });

        expect(storage.write).toHaveBeenCalledTimes(1);
        expect(storage.write).toHaveBeenCalledWith(
          'networks',
          state.storedNetworks,
        );
      });

      it('should dispatch changeNetwork action', async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = { url };

        expect.assertions(2);

        await deleteProvider({ commit, dispatch, getters, state }, { network });

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
          'changeNetwork',
          getters.networks[0].id,
        );
      });

      it('should not dispatch changeNetwork action', async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = {};

        expect.assertions(1);

        await deleteProvider({ commit, dispatch, getters, state }, { network });

        expect(dispatch).toHaveBeenCalledTimes(0);
      });

      it('should handle the removal error of the provider', async () => {
        const commit = jest.fn();
        const dispatch = jest.fn();
        const network = { url };
        const error = new Error();

        expect.assertions(4);

        storage.write.mockRejectedValueOnce(error);

        await deleteProvider({ commit, dispatch, getters, state }, { network });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
          root: true,
        });

        dispatch.mockClear();
        dispatch.mockRejectedValueOnce(error);

        await deleteProvider({ commit, dispatch, getters, state }, { network });

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
          root: true,
        });
      });
    });
  });
});
