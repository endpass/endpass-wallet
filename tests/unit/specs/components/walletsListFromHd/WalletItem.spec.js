import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';

import WalletItem from '@/components/walletsListFromHd/WalletItem';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);
localVue.use(UIComponents);

jest.useFakeTimers();

describe('WalletItem', () => {
  let accountsModule;
  let wrapper;

  beforeEach(() => {
    accountsModule = {
      namespaced: true,
      actions: {
        getBalanceByAddress: jest.fn(),
      },
    };
    const storeOptions = {
      modules: {
        accounts: accountsModule,
        web3: {
          namespaced: true,
          state: {
            activeCurrency: { name: 'usd' },
          },
          getters: {
            activeNetwork: jest.fn(),
          },
        },
      },
    };
    const store = new Vuex.Store(storeOptions);
    wrapper = shallowMount(WalletItem, {
      localVue,
      store,
      propsData: {
        address: 'addr',
      },
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('WalletItem');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('getBalance', () => {
      it('should call vuex getBalance with correct arguments', async () => {
        expect.assertions(4);

        expect(wrapper.vm.isLoading).toBe(false);

        accountsModule.actions.getBalanceByAddress.mockResolvedValueOnce({
          balance: '10',
        });
        await wrapper.vm.getBalance();

        expect(wrapper.vm.balance).toEqual('10');
        expect(accountsModule.actions.getBalanceByAddress).toBeCalledWith(
          expect.anything(),
          'addr',
          undefined,
        );
        expect(wrapper.vm.isLoading).toBe(false);
      });

      it('should throw error', async () => {
        expect.assertions(4);

        const error = new Error('Balance error');

        accountsModule.actions.getBalanceByAddress.mockRejectedValue(error);
        expect(wrapper.vm.isLoading).toBe(false);

        await wrapper.vm.getBalance();

        expect(wrapper.vm.balance).toEqual('0');
        expect(accountsModule.actions.getBalanceByAddress).toBeCalledWith(
          expect.anything(),
          'addr',
          undefined,
        );
        expect(wrapper.vm.isLoading).toBe(false);
      });
    });
  });
});
