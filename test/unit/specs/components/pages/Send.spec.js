import Vue from 'vue';
import Vuex from 'vuex';
import web3 from 'web3';
import { shallow, createLocalVue, mount } from '@vue/test-utils';
import Notifications from 'vue-notification';
import validation from '@/validation';
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
  let web3Instance = new web3('https://mainnet.infura.io/');

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        price: {
          price: 400,
        },
        accounts: {
          address: {
            getChecksumAddressString() {
              return '0x9eceefdf3554e178a6549006f2c02163e63c9fd8';
            },
          },
          settings: {
            fiatCurrency: 'USD',
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
        },
        web3: {
          web3: web3Instance,
          activeCurrency: {
            name: 'ETH',
          },
        },
        tokens: {
          activeTokens: [
            {
              symbol: 'AAA',
              address: '0xB6eD7644C69416d67B522e20bC294A9a9B405B31',
              decimals: 8,
            },
          ],
        },
      },
      actions,
      modules: {
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
        transactions: {
          namespaced: true,
          actions: {
            getNextNonce: jest.fn(),
            getNonceInBlock: jest.fn(),
          },
        },
      },
    });
    wrapper = shallow(Send, { store, localVue });
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

      wrapper.vm.$refs.address.$el.querySelector('input').value =
        '0xE824633E6d247e64ba2cD841D8270505770d53fE';

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

      const inputIdArr = ['address', 'gasPrice', 'gasLimit', 'value'];

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

    it('should update user nonce when changing the network or address', async () => {
      wrapper.vm.getNextNonce = jest.fn().mockResolvedValueOnce('2');
      wrapper.setComputed({ activeNet: 1 });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$data.userNonce).toBe('2');

      wrapper.vm.getNextNonce.mockResolvedValueOnce('5');
      wrapper.setComputed({ activeNet: 2 });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$data.userNonce).toBe('5');

      wrapper.vm.getNextNonce.mockResolvedValueOnce('7');
      wrapper.setComputed({ address: '0xkdjf' });
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.$data.userNonce).toBe('7');
    });
  });
});
