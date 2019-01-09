import { set } from 'lodash';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { shallow, createLocalVue } from '@vue/test-utils';
import { testUtils } from '@endpass/utils';
import TransactionForm from '@/components/pages/Send/TransactionForm.vue';
import { Transaction } from '@/class';
import ENSResolver from '@/class/ens';
import { transaction } from 'fixtures/transactions';
import { address } from 'fixtures/accounts';
import { token, tokens } from 'fixtures/tokens';
import { gasPrice } from 'fixtures/gasPrice';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('Send – TransactionForm', () => {
  let store;
  let wrapper;

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
    tokenInfo: token,
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
  };

  beforeEach(() => {
    jest.clearAllMocks();

    store = new Vuex.Store(Object.assign({}, defaultStore));

    wrapper = shallow(TransactionForm, {
      store,
      localVue,
      provide: () => ({
        $validator: new VeeValidate.Validator(),
      }),
      stubs: testUtils.generateStubs(TransactionForm),
      propsData: {
        transaction: transactionProp,
      },
    });
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
      wrapper = shallow(TransactionForm, {
        store,
        localVue,
        provide: () => ({
          $validator: new VeeValidate.Validator(),
        }),
        stubs: testUtils.generateStubs(TransactionForm),
        propsData: {
          transaction: {
            ...transactionProp,
            to: address,
          },
        },
      });

      wrapper.setComputed({
        isEnsTransaction: true,
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

    it('should render error on ens error', () => {
      wrapper.setComputed({
        isEnsTransaction: true,
      });
      wrapper.setData({
        ensError: 'foo',
        isEnsAddressLoading: false,
      });

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
      expect(wrapper.find('transaction-priority-options').exists()).toBe(true);
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

      describe('changeTokenInfo', () => {
        const tokenBySymbolGetterMock = jest.fn().mockReturnValue(tokens[0]);

        beforeEach(() => {
          store = new Vuex.Store(
            set(Object.assign({}, defaultStore), 'modules.tokens.getters', {
              ...tokensGetters,
              currentAccountTokenBySymbol: () => tokenBySymbolGetterMock,
            }),
          );
          wrapper = shallow(TransactionForm, {
            store,
            localVue,
            provide: () => ({
              $validator: new VeeValidate.Validator(),
            }),
            stubs: testUtils.generateStubs(TransactionForm),
            propsData: {
              transaction: transactionProp,
            },
          });
        });

        it('should change token info if it is not empty', () => {
          wrapper.vm.changeTokenInfo('SCDT');

          expect(tokenBySymbolGetterMock).toBeCalledWith('SCDT');
          expect(wrapper.vm.transaction.tokenInfo).toEqual(tokens[0]);
        });

        it('should not change token info if it is empty', () => {
          wrapper.vm.changeTokenInfo(null);

          expect(tokenBySymbolGetterMock).not.toBeCalled();
          expect(wrapper.vm.transaction.tokenInfo).toBe(null);
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
          ENSResolver.getAddress.mockRejectedValueOnce(new Error());

          const res = await wrapper.vm.resolveEnsAddress();

          expect(res).toBe('');
          expect(wrapper.vm.ensError).toBe(
            'ENS hello.eth can not be resolved.',
          );
        });
      });

      describe('estimateGasCost', () => {
        beforeAll(() => {
          Transaction.getGasFullPrice = jest.fn();
          Transaction.isToContract = jest.fn();
        });

        it('should estimate gas cost for transaction', async () => {
          expect.assertions(2);

          Transaction.getGasFullPrice.mockResolvedValueOnce(1);

          await wrapper.vm.estimateGasCost();

          expect(Transaction.getGasFullPrice).toBeCalledWith(transactionProp);
          expect(wrapper.vm.estimatedGasCost).toBe(1);
        });

        it('should handle error', async () => {
          expect.assertions(3);

          const error = new Error();
          const previousEstimatedGas = wrapper.vm.estimatedGasCost;
          const previousEnsError = wrapper.vm.ensError;

          Transaction.getGasFullPrice.mockRejectedValueOnce(error);

          await wrapper.vm.estimateGasCost();

          expect(wrapper.vm.estimatedGasCost).toBe(previousEstimatedGas);
          expect(wrapper.vm.ensError).toBe(previousEnsError);
          expect(Transaction.isToContract).toBeCalledWith(
            wrapper.vm.transaction,
          );
        });

        it('should set ens error if failing transaction is contract and error contains always failing transaction', async () => {
          expect.assertions(3);

          const error = new Error('always failing transaction');
          const previousEstimatedGas = wrapper.vm.estimatedGasCost;

          Transaction.getGasFullPrice.mockRejectedValueOnce(error);
          Transaction.isToContract.mockResolvedValueOnce(false);

          await wrapper.vm.estimateGasCost();

          expect(wrapper.vm.estimatedGasCost).toBe(previousEstimatedGas);
          expect(wrapper.vm.ensError).toBe(
            'Transaction will always fail, try other address.',
          );
          expect(Transaction.isToContract).toBeCalledWith(
            wrapper.vm.transaction,
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
        jest.spyOn(wrapper.vm, 'debouncedGasCostEstimation');
        jest.spyOn(wrapper.vm, 'resolveEnsAddress');
      });

      it('should request gas cost on changing token info', () => {
        wrapper.setProps({
          transaction: {
            ...transactionProp,
            tokenInfo: '0x0',
          },
        });

        expect(wrapper.vm.debouncedGasCostEstimation).toBeCalledTimes(1);
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

      it('should resolve esn address and request gas cost on changing address to ens', async () => {
        expect.assertions(2);

        const getAddressMock = jest.fn().mockResolvedValue(address);

        wrapper.setComputed({
          isEnsTransaction: true,
        });
        wrapper.setData({
          address: 'hello.eth',
          ensResolver: {
            getAddress: getAddressMock,
          },
        });

        await global.flushPromises();

        expect(wrapper.vm.resolveEnsAddress).toBeCalledTimes(1);
        expect(wrapper.vm.debouncedGasCostEstimation).toBeCalledTimes(1);
      });

      it('should request gas cost and set address to transaction on changing address', () => {
        expect.assertions(2);

        wrapper.setData({
          address,
        });

        expect(wrapper.vm.transaction.to).toBe(address);
        expect(wrapper.vm.debouncedGasCostEstimation).toBeCalledTimes(1);
      });

      it('should resolve ens address on change active network if current address is ens', async () => {
        expect.assertions(1);

        wrapper.setComputed({
          isEnsTransaction: true,
          activeNet: {
            id: 2,
          },
        });

        await global.flushPromises();

        expect(wrapper.vm.resolveEnsAddress).toBeCalledTimes(1);
      });

      it('should not resolve ens address on change active network if network id was not changed', async () => {
        expect.assertions(1);

        wrapper.setComputed({
          isEnsTransaction: true,
          activeNet: {
            id: 1,
          },
        });

        await global.flushPromises();

        expect(wrapper.vm.resolveEnsAddress).not.toBeCalled();
      });
    });
  });
});
