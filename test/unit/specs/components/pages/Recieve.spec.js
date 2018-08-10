import Vue from 'vue';
import { mount, shallow, createLocalVue } from '@vue/test-utils';
import moxios from 'moxios';
import Vuex from 'vuex';
import ReceivePage from '@/components/pages/Receive.vue';
import web3 from 'web3';
import ethereumWalletMock from '../../../ethereumWalletMock.js';

const wallet = ethereumWalletMock;

const localVue = createLocalVue();

localVue.use(Vuex);

describe('ReceivePage', () => {
  let actions = {
    'connectionStatus/updateApiErrorStatus': function() {},
  };
  let store;

  beforeEach(() => {
    moxios.install();
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
    moxios.uninstall();
  });

  // done callback is required for async tests
  it('downloads transaction history', done => {
    moxios.stubRequest(/api\.ethplorer\.io\/getAddressTransactions/, {
      status: 200,
      response: [
        {
          id: '1',
          to: wallet.getChecksumAddressString(),
        },
      ],
    });

    // new wrapper must be initialized in each test AFTER moxios.stubRequest
    const wrapper = shallow(ReceivePage, { store, localVue });

    moxios.wait(() => {
      let elems = wrapper.vm.transactions;
      expect(elems.length).toBe(1);
      expect(elems[0].to).toBe(wrapper.vm.address);
      done();
    });
  });
});
