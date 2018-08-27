import Vue from 'vue';
import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import HistoryPage from '@/components/pages/History.vue';
import ethereumWalletMock from 'fixtures/wallet';
import { generateStubs } from '@/utils/testUtils';

const wallet = ethereumWalletMock;

const localVue = createLocalVue();

localVue.use(Vuex);

describe('HistoryPage', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          state: {
            address: {
              getChecksumAddressString() {
                return '0x4BD5C3E7e4d6b3Df23e9DA5b42e5E4daa3D2579b';
              },
            },
          },
        },
        web3: {
          namespaced: true,
          state: {
            activeNet: {
              name: 'Main',
              id: 1,
            },
          },
        },
        connectionStatus: {
          namespaced: true,
          actions: {
            updateApiErrorStatus: jest.fn(),
          },
        },
        transactions: {
          namespaced: true,
          state: {
            transactionHistory: [],
          },
          actions: {
            getTransactionHistory: jest.fn(),
          },
          getters: {
            currentNetTransactions: () => [
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
                networkId: 1,
                input: '0x',
                success: true,
              },
            ],
          },
        },
      },
    });

    wrapper = shallow(HistoryPage, {
      store,
      localVue,
      stubs: generateStubs(HistoryPage),
    });
  });

  describe('render', () => {
    it('should display the correct body', () => {
      expect(wrapper.contains('ul.transactions')).toBeTruthy();
      expect(wrapper.findAll('ul.transactions li')).toHaveLength(2);

      wrapper.setComputed({ currentNetTransactions: [], activeNet: { id: 2 } });

      expect(wrapper.contains('ul.transactions')).toBeFalsy();
      expect(wrapper.html()).toContain(
        'Transaction history is only supported on the main network',
      );
    });

    it('should display a message about the absence of transactions', () => {
      wrapper.setComputed({ currentNetTransactions: [] });
      wrapper.setData({ isLoading: false });

      expect(wrapper.contains('ul.transactions')).toBeFalsy();
      expect(wrapper.html()).toContain('This account has no transactions');
    });

    describe('v-spinner', () => {
      it('should render v-spinner', () => {
        wrapper.setData({ isLoading: true });
        wrapper.setComputed({
          isHistoryAvailable: true,
          currentNetTransactions: [],
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

  describe('behavior', () => {
    it('should download transaction history', () => {
      const getHistory = jest.fn();
      wrapper = shallow(HistoryPage, {
        store,
        localVue,
        methods: {
          getHistory,
        },
      });

      expect(getHistory).toHaveBeenCalledTimes(1);
    });

    // FIXME getHistory don't work when $watch in created
    it('should update history when the account/net is changed', () => {
      const watcher = jest.spyOn(wrapper.vm, 'getTransactionHistory');

      wrapper.setComputed({ address: '0x0' });
      wrapper.setComputed({ activeNet: { id: 2 } });
      wrapper.setComputed({ activeNet: { id: 1 } });

      expect(watcher).toHaveBeenCalledTimes(2);
    });

    it('should`t update history when the account/net is not valid', () => {
      const watcher = jest.spyOn(wrapper.vm, 'getTransactionHistory');

      wrapper.setComputed({ address: null, isHistoryAvailable: true });
      wrapper.setComputed({ address: '0x0', isHistoryAvailable: false });

      expect(watcher).toHaveBeenCalledTimes(0);
    });
  });
});
