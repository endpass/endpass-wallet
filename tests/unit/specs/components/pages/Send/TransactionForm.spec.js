import { set } from 'lodash';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';
import { ENSResolver } from '@/class';
import validation from '@/validation';
import { wrapShallowMountFactory } from '@/testUtils';

import TransactionForm from '@/components/pages/Send/TransactionForm.vue';
import { transaction } from 'fixtures/transactions';
import { address } from 'fixtures/accounts';
import { token, tokens } from 'fixtures/tokens';
import { gasPrice } from 'fixtures/gasPrice';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('Send – TransactionForm', () => {
  let store;
  let wrapper;
  let wrapperFactory;

  const tokensGetters = {
    currentAccountTokensCurrencies: jest.fn(),
    currentAccountTokenBySymbol: () => jest.fn(),
  };
  const gasPriceActions = {
    getGasPrice: jest.fn().mockResolvedValue(gasPrice),
  };
  const transactionProp = {
    ...transaction,
    gasPrice: 0,
    token,
  };
  const defaultStore = {
    state: {
      accounts: {
        balance: '1000000',
      },
      web3: {
        activeNet: {
          id: 1,
        },
      },
      user: {
        settings: {
          fiatCurrency: 'USD',
        },
      },
      price: {
        price: 10,
      },
      connectionStatus: {
        isSyncing: true,
      },
    },

    modules: {
      transactions: {
        namespaced: true,
        getters: {
          allowedToSendAddresses: jest.fn(),
        },
      },

      tokens: {
        namespaced: true,
        getters: tokensGetters,
      },

      gasPrice: {
        namespaced: true,
        actions: gasPriceActions,
      },
    },

    mutations: {
      testActiveNet(state, net) {
        state.web3.activeNet = net;
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    store = new Vuex.Store(Object.assign({}, defaultStore));

    wrapperFactory = wrapShallowMountFactory(TransactionForm, {
      store,
      localVue,
      sync: false,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
      propsData: {
        transaction: transactionProp,
      },
    });
    wrapper = wrapperFactory();
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper.vm.estimateGasCost = jest.fn();
    });

    it('should render without error and resolved address by default', () => {
      expect(wrapper.html()).toMatchSnapshot();
      expect(wrapper.find('.help.is-danger').exists()).toBe(false);
      expect(wrapper.find('.help.ellipsis').exists()).toBe(false);
    });

    it('should render message if ens address resolved', () => {
      wrapper = wrapperFactory({
        store,
        localVue,
        provide: () => ({
          $validator: new VeeValidate.Validator(),
        }),
        propsData: {
          transaction: {
            ...transactionProp,
            to: address,
          },
        },
        computed: {
          isEnsTransaction: true,
        },
      });

      wrapper.setData({
        ensError: null,
        isEnsAddressLoading: false,
      });

      expect(wrapper.html()).toMatchSnapshot();
      expect(wrapper.find('.help.is-danger').exists()).toBe(false);
      expect(wrapper.find('.help.ellipsis').exists()).toBe(true);
      expect(wrapper.find('.help.ellipsis').text()).toBe(
        `Resolved ENS address: ${address}`,
      );
    });

    it('should render error on ens error', async () => {
      expect.assertions(4);

      wrapper = wrapperFactory({
        computed: {
          isEnsTransaction: true,
        },
      });
      wrapper.setData({
        ensError: 'foo',
        isEnsAddressLoading: false,
      });

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toMatchSnapshot();
      expect(wrapper.find('.help.is-danger').exists()).toBe(true);
      expect(wrapper.find('.help.ellipsis').exists()).toBe(false);
      expect(wrapper.find('.help.is-danger').text()).toBe('foo');
    });

    it('should render priority options if gas price is not null', () => {
      wrapper.setData({
        prices: {
          low: 1,
          medium: 2,
          high: 3,
        },
      });

      expect(wrapper.html()).toMatchSnapshot();
      expect(wrapper.find('transaction-priority-options-stub').exists()).toBe(
        true,
      );
    });
  });

  describe('behavior', () => {
    describe('methods', () => {
      it('should load gas price on mount', () => {
        expect(gasPriceActions.getGasPrice).toBeCalledTimes(1);
      });

      it('should merge transaction with given advanced options', () => {
        wrapper.vm.handleAdvancedChange({
          foo: 'bar',
        });

        expect(wrapper.vm.transaction).toEqual({
          ...transactionProp,
          foo: 'bar',
        });
      });

      describe('changeToken', () => {
        const tokenBySymbolGetterMock = jest.fn().mockReturnValue(tokens[0]);

        beforeEach(() => {
          store = new Vuex.Store(
            set(Object.assign({}, defaultStore), 'modules.tokens.getters', {
              ...tokensGetters,
              currentAccountTokenBySymbol: () => tokenBySymbolGetterMock,
            }),
          );
          wrapper = wrapperFactory({
            store,
            localVue,
            provide: () => ({
              $validator: new VeeValidate.Validator(),
            }),
            propsData: {
              transaction: transactionProp,
            },
          });
        });

        it('should change token info if it is not empty', () => {
          wrapper.vm.changeToken('SCDT');

          expect(tokenBySymbolGetterMock).toBeCalledWith('SCDT');
          expect(wrapper.vm.transaction.token).toEqual(tokens[0]);
        });

        it('should not change token info if it is empty', () => {
          wrapper.vm.changeToken(null);

          expect(tokenBySymbolGetterMock).not.toBeCalled();
          expect(wrapper.vm.transaction.token).toBe(null);
        });
      });

      describe('resolveEnsAddress', () => {
        it('shound resolve address and return it without error', async () => {
          expect.assertions(2);

          const res = await wrapper.vm.resolveEnsAddress();

          expect(res).toBe(address);
          expect(wrapper.vm.ensError).toBe(null);
        });

        it('shound handle error, print it and return empty string', async () => {
          expect.assertions(2);

          wrapper.setData({
            address: 'hello.eth',
          });

          wrapper.vm.$forceUpdate();
          await wrapper.vm.$nextTick();

          ENSResolver.getAddress.mockRejectedValueOnce(new Error());

          const res = await wrapper.vm.resolveEnsAddress();

          expect(res).toBe('');
          expect(wrapper.vm.ensError).toBe(
            'ENS hello.eth can not be resolved.',
          );
        });
      });

      describe('loadGasPrice', () => {
        it('should request gas price and set transaction price as medium price', async () => {
          expect.assertions(1);

          await wrapper.vm.loadGasPrice();

          expect(wrapper.vm.transaction.gasPrice).toBe(
            gasPrice.medium.toString(),
          );
        });
      });
    });

    describe('watchers', () => {
      beforeEach(() => {
        jest.spyOn(wrapper.vm, 'resolveEnsAddress');
      });

      it('should set address as empty string if transaction to is not exist', () => {
        wrapper.setProps({
          transaction: {
            ...transactionProp,
            to: '',
          },
        });

        expect(wrapper.vm.address).toBe('');
      });

      it('should resolve esn address on changing address to ens', async () => {
        expect.assertions(1);

        wrapper = wrapperFactory({
          computed: {
            isEnsTransaction: true,
          },
        });

        jest.spyOn(wrapper.vm, 'resolveEnsAddress');

        ENSResolver.getAddress.mockResolvedValue(address);

        wrapper.setData({
          address: 'hello.eth',
        });

        await global.flushPromises();

        expect(wrapper.vm.resolveEnsAddress).toBeCalledTimes(1);
      });

      it('should resolve ens address on change active network if current address is ens', async () => {
        expect.assertions(1);

        wrapper = wrapperFactory({
          computed: {
            isEnsTransaction: true,
          },
        });

        jest.spyOn(wrapper.vm, 'resolveEnsAddress');

        store.commit('testActiveNet', { id: 2 });

        await global.flushPromises();

        expect(wrapper.vm.resolveEnsAddress).toBeCalledTimes(1);
      });

      it('should not resolve ens address on change active network if network id was not changed', async () => {
        expect.assertions(1);

        // revert default value
        store.commit('testActiveNet', { id: 1 });

        wrapper = wrapperFactory({
          computed: {
            isEnsTransaction: true,
          },
        });

        jest.spyOn(wrapper.vm, 'resolveEnsAddress');

        store.commit('testActiveNet', { id: 1 });

        await global.flushPromises();

        expect(wrapper.vm.resolveEnsAddress).not.toBeCalled();
      });
    });
  });
});
