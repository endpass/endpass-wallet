import Vue from 'vue';
import validation from '@/validation';
import Vuex from 'vuex';
import Web3 from 'web3';
import { shallow, createLocalVue, mount } from '@vue/test-utils';
import Notifications from 'vue-notification';
import { Transaction } from '@/class';
import { generateStubs } from '@/utils/testUtils';

import Send from '@/components/pages/Send.vue';

Transaction.prototype.getFullPrice = jest.fn().mockResolvedValue();

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Notifications);

describe('Send', () => {
  let actions;
  let store;
  let wrapper;
  const web3Instance = new Web3('https://mainnet.infura.io/');

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        price: {
          price: 400,
        },
        user: {
          settings: {
            fiatCurrency: 'USD',
          },
        },
        web3: {
          web3: web3Instance,
          activeCurrency: {
            name: 'ETH',
          },
          activeNet: {
            id: 1,
          },
        },
        connectionStatus: {
          isSyncing: false,
        },
      },
      actions,
      modules: {
        accounts: {
          namespaced: true,
          state: {
            address: {
              getChecksumAddressString() {
                return '0x9eceefdf3554e178a6549006f2c02163e63c9fd8';
              },
            },
            balance: '1000000000000000000',
            pendingTransactions: [
              {
                timestamp: 1524505925,
                from: '0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b',
                to: '0x7c59542b20002ed255598172cab48b86d865dfbb',
                hash:
                  '0x7fcb1e71def6d0d353251831f46d60401e6321b5e0b0b135085be4688ca2a9b1',
                value: 0.009979,
                input: '0x',
                success: true,
              },
            ],
            wallets: () => [],
            wallet: {
              isPublic: false,
            },
          },
          getters: {
            isPublicAccount: () => true,
          },
        },
        gasPrice: {
          namespaced: true,
          actions: {
            getGasPrice() {
              return new Promise(res =>
                res({
                  low: '1',
                  medium: '2',
                  high: '3',
                }),
              );
            },
          },
        },
        tokens: {
          namespaced: true,
          getters: {
            allCurrentAccountTokensWithNonZeroBalance: () => [
              {
                symbol: 'AAA',
                address: '0xB6eD7644C69416d67B522e20bC294A9a9B405B31',
                decimals: 8,
              },
            ],
          },
        },
        transactions: {
          namespaced: true,
          actions: {
            getNextNonce: jest.fn(),
            getNonceInBlock: jest.fn(),
          },
          getters: {
            addressesFromTransactions: () => [],
          },
        },
      },
    });
    wrapper = shallow(Send, { store, localVue });
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallow(Send, {
        store,
        localVue,
        stubs: generateStubs(Send),
      });
    });

    it('should render ens error', async () => {
      expect.assertions(1);

      wrapper.setData({
        ensError: 'foo',
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render resolved ens address', async () => {
      expect.assertions(1);

      wrapper.setData({
        transaction: {
          to: '0x0',
        },
      });
      wrapper.setComputed({
        isEnsTransaction: true,
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should validate data', async () => {
      const getFullPrice = jest.fn().mockResolvedValue('400');

      wrapper = mount(Send, {
        store,
        localVue,
        computed: {
          maxAmount: () => 2,
        },
      });

      const { errors } = wrapper.vm;

      wrapper.setData({
        transaction: {
          to: '',
          gasPrice: '900',
          gasLimit: '2200000000',
          data: 'asdfas',
          getFullPrice,
        },
        value: '2.222222222222222222222222',
      });

      await wrapper.vm.$validator.validateAll();

      expect(errors.first('gasPrice').includes('between')).toBeTruthy();
      expect(errors.first('gasLimit').includes('between')).toBeTruthy();
      expect(errors.first('price').includes('between')).toBeTruthy();
      expect(errors.first('value').includes('decimal')).toBeTruthy();
      expect(errors.first('data').includes('hex')).toBeTruthy();

      wrapper.setData({
        transaction: {
          ...wrapper.vm.transaction,
          to: '',
          gasPrice: '91',
          gasLimit: '22000',
          // prettier-ignore
          data: '0xa9059cbb000000000000000000000000b6ed7644c69416d67b522e20bc294a9a9b405b31000000000000000000000000000000000000000000000000000000003b9aca00'
        },
        value: '1.5',
      });

      await wrapper.vm.$validator.validateAll();

      expect(errors.has('gasPrice')).toBeFalsy();
      expect(errors.has('gasLimit')).toBeFalsy();
      expect(errors.has('price')).toBeFalsy();
      expect(errors.has('value')).toBeFalsy();
      expect(errors.has('data')).toBeFalsy();

      wrapper.setData({
        transaction: {
          ...wrapper.vm.transaction,
          to: '123',
          gasPrice: '-90',
          gasLimit: '-22000',
          data: '0x',
        },
        value: '-2.22222',
      });

      await wrapper.vm.$validator.validateAll();

      expect(errors.first('gasPrice').includes('numeric')).toBeTruthy();
      expect(errors.first('gasLimit').includes('numeric')).toBeTruthy();
      expect(errors.first('price').includes('between')).toBeTruthy();
      expect(errors.first('value').includes('between')).toBeTruthy();

      wrapper.setComputed({
        balance: '0',
      });

      wrapper.setData({
        estimateGasCost: '1000000000000000',
      });

      expect(errors.firstById('insufficientBalance')).toBeTruthy();

      wrapper.setComputed({
        balance: '1000000000000000000',
      });

      wrapper.setData({
        estimateGasCost: '1000000000000000',
      });

      expect(errors.firstById('insufficientBalance')).toBeFalsy();
    });

    it('should allow empty string in input', () => {
      wrapper = mount(Send, {
        store,
        localVue,
      });

      const inputIdArr = ['gasPrice', 'gasLimit', 'value'];

      inputIdArr
        .map(inputId => wrapper.find(`#${inputId}`))
        .forEach(inputElem => {
          inputElem.element.value = '';
          inputElem.trigger('input');
          expect(inputElem.element.value).toBe('');
        });
    });

    it('should sync amount and price input', () => {
      wrapper = mount(Send, {
        store,
        localVue,
      });

      const valueInput = wrapper.find('input#value');
      const priceInput = wrapper.find('input#price');

      valueInput.element.value = 2;
      valueInput.trigger('input');

      expect(wrapper.vm.price).toBe('800.00');

      priceInput.element.value = 1200;
      priceInput.trigger('input');

      expect(wrapper.vm.value).toBe('3.000000000000000000');
    });

    it('should set transaction value to the maximum amount', () => {
      wrapper.vm.$validator.validate = jest.fn();

      wrapper.vm.setMaxAmount();

      const maxAmount = wrapper.vm.maxAmount.toString();

      expect(wrapper.vm.transaction.value).toBe(maxAmount);
      expect(wrapper.vm.value).toBe(maxAmount);
    });

    it('should disable price input when zero eth price', () => {
      wrapper = shallow(Send, {
        store,
        localVue,
        stubs: generateStubs(Send),
      });

      const inputElem = wrapper.find('v-input#price');

      wrapper.setComputed({
        ethPrice: 0,
      });

      expect(inputElem.attributes().disabled).toBeTruthy();

      wrapper.setComputed({
        ethPrice: 1,
      });

      expect(inputElem.attributes().disabled).toBeFalsy();
    });

    it('should update user nonce when changing the network', async () => {
      wrapper.vm.getNextNonce = jest.fn().mockResolvedValueOnce('2');
      wrapper.setComputed({
        activeNet: { id: 2 },
      });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$data.userNonce).toBe('2');

      wrapper.vm.getNextNonce.mockResolvedValueOnce('5');
      wrapper.setComputed({
        activeNet: { id: 3 },
      });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$data.userNonce).toBe('5');
    });

    it('should update user nonce when changing the address', async () => {
      wrapper.vm.getNextNonce = jest.fn().mockResolvedValueOnce('2');
      wrapper.setData({ address: '0xddddd' });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$data.userNonce).toBe('2');

      wrapper.vm.getNextNonce.mockResolvedValueOnce('7');
      wrapper.setData({ address: '0xkdjf' });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$data.userNonce).toBe('7');
    });

    it('should call get ENS after each network change', async () => {
      expect.assertions(1);

      wrapper.setData({
        address: 'ether.eth',
      });

      wrapper.vm.getEnsAddress = jest.fn();

      wrapper.setComputed({
        isEnsTransaction: true,
        activeNet: {
          id: 2,
        },
      });
      wrapper.setComputed({
        isEnsTransaction: true,
        activeNet: {
          id: 3,
        },
      });

      expect(wrapper.vm.getEnsAddress).toHaveBeenCalledTimes(2);
    });
  });
});
