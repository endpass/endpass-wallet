import Vue from 'vue';
import Vuex from 'vuex';
import web3 from 'web3';
import { shallow, createLocalVue, mount } from '@vue/test-utils';
import Notifications from 'vue-notification';
import validation from '@/validation';

import Send from '@/components/pages/Send.vue';

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
            getAddressString() {
              return '0x9eceefdf3554e178a6549006f2c02163e63c9fd8';
            },
          },
          settings: {
            fiatCurrency: 'USD',
          },
          balance: null,
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
    });
    wrapper = shallow(Send, { store, localVue });
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
    wrapper.setData({
      value: '2',
    });

    expect(wrapper.vm.price).toBe('800.00');

    wrapper.setData({
      price: '1200',
    });

    expect(wrapper.vm.value).toBe('3.000000000000000000');
  });
});
