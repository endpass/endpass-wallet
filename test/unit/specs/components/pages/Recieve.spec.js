import { shallow, createLocalVue } from '@vue/test-utils';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Vuex from 'vuex';
import ReceivePage from '@/components/pages/Receive.vue';
import web3 from 'web3';
import ethereumWalletMock from '../../../fixtures/wallet.js';

const wallet = ethereumWalletMock;

const localVue = createLocalVue();

localVue.use(Vuex);

describe('ReceivePage', () => {
  let actions = {
    'connectionStatus/updateApiErrorStatus': function() {},
  };
  let store;
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);

    store = new Vuex.Store({
      state: {
        web3: {
          web3,
          activeCurrency: {
            name: 'ETH',
          },
        },
      },
      actions,
      modules: {
        accounts: {
          namespaced: true,
          state: {
            address: wallet,
          },
          getters: {
            balance: jest.fn(),
          },
        },
      },
    });
  });

  afterEach(() => {
    mock.reset();
  });

  // done callback is required for async tests
  it.only('downloads transaction history', async () => {
    mock
      .onGet(/api\.ethplorer\.io\/getAddressTransactions/)
      .reply(200, [{ id: '1', to: wallet.getChecksumAddressString() }]);

    // new wrapper must be initialized in each test AFTER setting up mock
    const wrapper = shallow(ReceivePage, { store, localVue });
    // Wait for promises in created() hook to resolve
    await flushPromises();

    let elems = wrapper.vm.transactions;
    expect(elems.length).toBe(1);
    expect(elems[0].to).toBe(wrapper.vm.address);
  });
});
