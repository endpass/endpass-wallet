import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import dayjs from 'dayjs';
import Notifications from 'vue-notification';
import Transaction from '@/components/Transaction';
import { generateStubs } from '@/utils/testUtils';
import { checksumAddress } from 'fixtures/accounts';

describe('Transaction', () => {
  const accountsActions = {
    resendTransaction: jest.fn(),
    cancelTransaction: jest.fn(),
  };
  let wrapper;

  beforeEach(() => {
    const localVue = createLocalVue();

    localVue.use(Notifications);
    localVue.use(Vuex);

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
    };
    const store = new Vuex.Store(storeOptions);

    wrapper = shallow(Transaction, {
      localVue,
      store,
      stubs: generateStubs(Transaction),
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
      it('should render loader', () => {
        wrapper.setData({
          state: 'resent',
          transactionToSend: {
            state: 'pending',
          },
        });

        expect(wrapper.find('v-spinner').html()).toMatchSnapshot();

        wrapper.setData({
          state: 'canceled',
        });

        expect(wrapper.find('v-spinner').html()).toMatchSnapshot();
      });

      it('should not render loader', () => {
        wrapper.setData({
          transactionToSend: null,
        });

        expect(wrapper.find('v-spinner').exists()).toBeFalsy();
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
      expect(dayjs(wrapper.vm.displayDate).diff(dayjs(date), 's')).toBe(10);
    });
  });
});
