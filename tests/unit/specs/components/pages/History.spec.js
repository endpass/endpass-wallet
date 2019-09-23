import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import UIComponents from '@endpass/ui';
import { wrapShallowMountFactory } from '@/testUtils';
import setupI18n from '@/locales/i18nSetup';

import HistoryPage from '@/components/pages/History.vue';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(Vuex);
localVue.use(UIComponents);

describe('HistoryPage', () => {
  let wrapper;
  let store;
  let wrapperFactory;

  beforeEach(() => {
    jest.clearAllMocks();

    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          state: {
            address: '0x4BD5C3E7e4d6b3Df23e9DA5b42e5E4daa3D2579b',
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
            updateTransactionHistory: jest.fn(),
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

      mutations: {
        testActiveNet(state, net) {
          state.web3.activeNet = net;
        },
        testAccountAddress(state, address) {
          state.accounts.address = address;
        },
      },
    });

    wrapperFactory = wrapShallowMountFactory(HistoryPage, {
      store,
      localVue,
      i18n,
    });
    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should display the correct body', () => {
      expect(wrapper.contains('ul.transactions')).toBeTruthy();
      expect(wrapper.findAll('ul.transactions li')).toHaveLength(2);

      wrapper = wrapperFactory({
        computed: {
          currentNetTransactions: [],
          activeNet: { id: 2 },
        },
      });

      expect(wrapper.contains('ul.transactions')).toBeFalsy();
      expect(wrapper.html()).toContain(
        'Transaction history is only supported on the main network',
      );
    });

    it('should display a message about the absence of transactions', async () => {
      expect.assertions(2);

      wrapper = wrapperFactory({
        computed: {
          currentNetTransactions: [],
        },
      });

      wrapper.setData({ isLoading: false });

      await wrapper.vm.$nextTick();

      expect(wrapper.find('ul.transactions').exists()).toBe(false);
      expect(wrapper.html()).toContain('This account has no transactions');
    });

    describe('v-spinner', () => {
      it('should render v-spinner', () => {
        wrapper = wrapperFactory({
          computed: {
            isHistoryAvailable: true,
            currentNetTransactions: [],
          },
        });
        wrapper.setData({ isLoading: true });

        expect(wrapper.find('v-spinner-stub').exists()).toBe(true);
      });

      it('should not render v-spinner', () => {
        wrapper.setData({
          isLoading: false,
        });

        expect(wrapper.find('v-spinner-stub').exists()).toBeFalsy();
      });
    });
  });

  describe('behavior', () => {
    it('should download transaction history', () => {
      const getHistory = jest.fn();
      wrapper = shallowMount(HistoryPage, {
        i18n,
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
      const watcher = jest.spyOn(wrapper.vm, 'updateTransactionHistory');

      store.commit('testAccountAddress', '0x0');
      store.commit('testActiveNet', { id: 2 });
      store.commit('testActiveNet', { id: 1 });

      expect(watcher).toHaveBeenCalledTimes(2);
    });

    it('should`t update history when the account/net is not valid', () => {
      const watcher = jest.spyOn(wrapper.vm, 'updateTransactionHistory');

      store.commit('testAccountAddress', null);
      store.commit('testActiveNet', { id: 1 });

      store.commit('testActiveNet', { id: 10 });
      store.commit('testAccountAddress', '0x0');

      expect(watcher).toHaveBeenCalledTimes(0);
    });
  });
});
