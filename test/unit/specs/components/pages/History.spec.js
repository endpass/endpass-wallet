import Vue from 'vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mount, shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import HistoryPage from '@/components/pages/History.vue';
import { infuraConf } from '@/config';
import ethereumWalletMock from '../../../fixtures/wallet.js';
import { generateStubs } from '@/utils/testUtils';

const wallet = ethereumWalletMock;

const localVue = createLocalVue();

localVue.use(Vuex);
describe('HistoryPage', () => {
  let actions = {
    'connectionStatus/updateApiErrorStatus': function() {},
  };
  let store;
  let wrapper;
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock
      .onGet(/api\.ethplorer\.io\/getAddressTransactions/)
      .reply(200, [{ id: '1', to: wallet.getChecksumAddressString() }]);

    mock.onGet(/api\.ethplorer\.io\/getAddressHistory/).reply(200, {
      operations: [
        {
          id: '2',
          from: wallet.getChecksumAddressString(),
        },
      ],
    });

    store = new Vuex.Store({
      state: {
        accounts: {
          address: {
            getChecksumAddressString() {
              return '0x4BD5C3E7e4d6b3Df23e9DA5b42e5E4daa3D2579b';
            },
          },
        },
        web3: {
          activeNet: {
            name: 'Main',
            id: 1,
          },
        },
      },
      actions,
      getters: {
        'transactions/accountTransactions'() {
          return [
            {
              date: new Date('01/01/2007'),
              from: '0x4BD5C3E7e4d6b3Df23e9DA5b42e5E4daa3D2579b',
              to: '0x7c59542b20002ed255598172cab48b86d865dfbb',
              hash:
                '0x7fcb1e71def6d0d353251831f46d60401e6321b5e0b0b135085be4688ca2a9b1',
              value: 0.009979,
              networkId: 1,
              input: '0x',
              success: true,
            },
            {
              date: new Date('01/01/2003'),
              from: '0x7c59542b20002ed255598172cab48b86d865dfbb',
              to: '0x4BD5C3E7e4d6b3Df23e9DA5b42e5E4daa3D2579b',
              hash:
                '0x7fcb1e71def6d0d353251831f46d67392e6321b5e0b0b135085be4688ca2a9b1',
              value: 0.0079,
              networkId: 2,
              input: '0x',
              success: true,
            },
          ];
        },
      },
    });
  });

  afterEach(() => {
    mock.reset();
  });

  it('downloads transaction history', async () => {
    const wrapper = shallow(HistoryPage, { store, localVue });
    await flushPromises();

    let elems = wrapper.vm.transactions;
    expect(elems.length).toBe(2);
    expect(elems[0].to).toBe(wallet.getChecksumAddressString());
  });

  it('updates transactions on account change', async () => {
    const wrapper = shallow(HistoryPage, { store, localVue });
    const watcher = jest.spyOn(wrapper.vm, 'getMainHistory');
    store.state.accounts.address = {
      getChecksumAddressString() {
        return '0x0';
      },
    };
    await wrapper.vm.$nextTick();
    expect(watcher).toHaveBeenCalled();
  });

  it('sort transactions by date', () => {
    const wrapper = shallow(HistoryPage, { store, localVue });
    const trx1 = {
      date: new Date('01/01/2010'),
      networkId: 1,
    };
    const trx2 = {
      date: new Date('01/01/2001'),
      networkId: 1,
    };
    const trx3 = {
      networkId: 1,
    };
    wrapper.vm.transactions = [trx1, trx2, trx3];
    const result = wrapper.vm.processedTransactions;
    expect(result[0]).toBe(trx3);
    expect(result[1]).toBe(trx1);
  });
  it('displays correct body', async () => {
    const wrapper = shallow(HistoryPage, { store, localVue });
    expect(wrapper.contains('ul.transactions')).toBeTruthy();
    expect(wrapper.findAll('ul.transactions li').length).toBe(1);
    store.state.web3.activeNet.id = 2;
    await Vue.nextTick();
    expect(wrapper.contains('ul.transactions')).toBeTruthy();
    expect(wrapper.findAll('ul.transactions li').length).toBe(1);
    store.state.web3.activeNet.id = 3;
    await Vue.nextTick();
    expect(wrapper.contains('ul.transactions')).toBeFalsy();
    expect(wrapper.html()).toContain(
      'Transaction history is only supported on the main network',
    );
  });
  it('displays no transactions message', async () => {
    const store = new Vuex.Store({
      state: {
        accounts: {
          address: {
            getChecksumAddressString() {
              return '0x4BD5C3E7e4d6b3Df23e9DA5b42e5E4daa3D2579b';
            },
          },
        },
        web3: {
          activeNet: {
            name: 'Main',
            id: 1,
          },
        },
      },
      actions,
      getters: {
        'transactions/accountTransactions'() {
          return [];
        },
      },
    });
    const wrapper = shallow(HistoryPage, { store, localVue });
    wrapper.vm.isLoading = false;
    await Vue.nextTick();
    expect(wrapper.contains('ul.transactions')).toBeFalsy();
    expect(wrapper.html()).toContain('This account has no transactions');
  });
  it('filters transactions by network', () => {
    const wrapper = shallow(HistoryPage, { store, localVue });
    const trx1 = {
      date: new Date('01/01/2010'),
      networkId: 1,
    };
    const trx2 = {
      date: new Date('01/01/2001'),
      networkId: 1,
    };
    const trx3 = {
      networkId: 3,
    };
    wrapper.vm.transactions = [trx1, trx2, trx3];
    const result = wrapper.vm.processedTransactions;
    expect(result).not.toContain(trx3);
  });
  it('concats transactions', done => {
    moxios.stubRequest(/api\.ethplorer\.io\/getAddressTransactions/, {
      status: 200,
      response: [
        {
          id: '1',
          to: wallet.getChecksumAddressString(),
        },
      ],
    });

    moxios.stubRequest(/api\.ethplorer\.io\/getAddressHistory/, {
      status: 200,
      response: {
        operations: [
          {
            id: '2',
            from: wallet.getChecksumAddressString(),
          },
        ],
      },
    });

    // new wrapper must be initialized in each test AFTER moxios.stubRequest
  it('concats transactions', async () => {
    const wrapper = shallow(HistoryPage, { store, localVue });
    await flushPromises();

    let elems = wrapper.vm.processedTransactions;
    expect(elems.length).toBe(3);
    expect(elems[2].from).toBe(wrapper.vm.address);
    expect(elems[2].timestamp).toBe(
      store.getters['transactions/accountTransactions'][0].timestamp,
    );
  });

  describe('render', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = shallow(HistoryPage, {
        store,
        localVue,
        stubs: generateStubs(HistoryPage),
      });
    });

    describe('v-spinner', () => {
      it('should render v-spinner', () => {
        wrapper.setData({
          isLoading: true,
        });
        wrapper.setComputed({
          historyAvailable: true,
          processedTransactions: [],
        });

        expect(wrapper.find('v-spinner').attributes()).toEqual({
          'is-loading': 'true',
        });
      });

      it('should not render v-spinner', () => {
        wrapper.setData({
          isLoading: false,
        });

        expect(wrapper.find('v-spinner').exists()).toBeFalsy();
      });
    });
  });
});
