import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';

import Transaction from '@/components/Transaction';
import { generateStubs } from '@/utils/testUtils';

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
            address: {
              getChecksumAddressString: jest.fn(),
            },
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
});
