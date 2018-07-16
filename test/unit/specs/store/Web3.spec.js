import store from '@/store/web3/web3';
import LocalStorageMock from '../../localStorageMock.js';
import testAction from '../ActionTestingHelper';

jest.mock('@/services/user', () => require('../../__mocks__/services/user'));
global.localStorage = LocalStorageMock;

const commit = state => (type, payload) =>
  store.mutations[type](state, payload);

//Fake action from antoher storage
store.actions['tokens/subscribeOnTokenUpdates'] = jest.fn();

const dispatch = context => type => {
  store.actions[type](context);
};

const stateInstance = store.state();

describe('web3 store', async () => {
  beforeEach(async () => {
    localStorage.setItem('net', 1);
    localStorage.setItem(
      'networks',
      JSON.stringify([
        { name: 'TestNet', id: 4, url: 'https://testnet.infura.io/' },
      ]),
    );

    store.state = stateInstance;
    await store.actions.init({
      commit: commit(stateInstance),
      dispatch: dispatch({ state: stateInstance, commit, dispatch }),
      state: stateInstance,
    });
  });

  it('should sync remote and local storage', async () => {
    const netInLocalStore = JSON.parse(localStorage.getItem('net'));
    const networksInLocalStore = JSON.parse(localStorage.getItem('networks'));

    expect(stateInstance.activeNet.id).toBe(3);
    expect(netInLocalStore).toBe(3);
    expect(stateInstance.storedNetworks.length).toBe(1);
    expect(stateInstance.storedNetworks[0].id).toBe(5);
    expect(networksInLocalStore[0].id).toBe(5);
  });

  it('should get full list of networks', () => {
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

  it('should add provider network', () => {
    store.mutations.addNewProvider(stateInstance, {
      name: 'Test',
      id: 5,
      url: 'test.test',
    });
    expect(stateInstance.storedNetworks.length).toBe(2);
    expect(stateInstance.storedNetworks[1].id).toBe(5);
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
        { type: 'tokens/subscribeOnTokenUpdates' },
      ],
      done,
    );
  });

  it('should add provider network', done => {
    testAction(
      store.actions.addNewProvider,
      {
        id: 3,
      },
      {
        state: {
          storedNetworks: [],
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
      [{ type: 'addNewProvider' }],
      [{ type: 'changeNetwork' }],
      done,
    );
  });
});
