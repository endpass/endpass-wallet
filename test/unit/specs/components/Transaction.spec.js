import Vuex from 'vuex';
import Notifications from 'vue-notification';
import VeeValidate from 'vee-validate';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';
import validation from '@/validation';

import Transaction from '@/components/Transaction';

import { checksumAddress } from 'fixtures/accounts';

const localVue = createLocalVue();

localVue.use(Notifications);
localVue.use(Vuex);
localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('Transaction', () => {
  const accountsActions = {
    resendTransaction: jest.fn(),
    cancelTransaction: jest.fn(),
  };
  let wrapper;

  beforeEach(() => {
    const storeOptions = {
      modules: {
        accounts: {
          namespaced: true,
          state: {
            address: checksumAddress,
          },
          getters: {
            isPublicAccount: jest.fn(() => false),
          },
          accountsActions,
        },
        connectionStatus: {
          namespaced: true,
          state: {
            isSyncing: false,
          },
        },
      },
    };
    const transaction = {
      state: 'pending',
      value: 0,
      from: 'fromAddr',
      to: 'toAddr',
    };
    const store = new Vuex.Store(storeOptions);

    wrapper = shallowMount(Transaction, {
      localVue,
      store,
      propsData: {
        transaction,
      },
    });
  });

  afterEach(() => {
    accountsActions.resendTransaction.mockClear();
    accountsActions.cancelTransaction.mockClear();
  });

  describe('render', () => {
    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    describe('action process', () => {
      it('should render loader with pending text', () => {
        wrapper.setData({
          state: 'resent',
          transactionToSend: {
            state: 'pending',
          },
        });

        expect(wrapper.find('v-spinner-stub').html()).toMatchSnapshot();
      });

      it('should render loader with canceling text', () => {
        wrapper.setData({
          state: 'canceled',
          transactionToSend: {
            state: 'pending',
          },
        });

        expect(wrapper.find('v-spinner-stub').html()).toMatchSnapshot();
      });

      it('should not render loader', () => {
        wrapper.setData({
          transactionToSend: null,
        });

        expect(wrapper.find('v-spinner-stub').exists()).toBeFalsy();
      });
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should start timer at component creating', () => {
      expect(wrapper.vm.dateTimer).not.toBeNull();
    });

    it('should add one minute each minute to display date', () => {
      const date = new Date();

      wrapper.setData({
        displayDate: date,
      });

      jest.runOnlyPendingTimers();
      jest.advanceTimersByTime(10000);

      expect(wrapper.vm.displayDate).not.toBe(date);
      const displaceDate = new Date(wrapper.vm.displayDate);
      const diff = Math.abs(date - displaceDate);

      expect(Math.floor(diff / 1000)).toBe(10); // 10 seconds
    });
  });
});
