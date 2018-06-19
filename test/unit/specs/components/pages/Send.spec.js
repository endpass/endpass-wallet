import Vue from 'vue';
import Vuex from 'vuex';
import web3 from 'web3';
import { shallow, createLocalVue, mount } from '@vue/test-utils';
import Notifications from 'vue-notification'
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
        accounts: {
          activeAccount: {
            getAddressString() {
              return '0x9eceefdf3554e178a6549006f2c02163e63c9fd8';
            },
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
  it('sets correct data', () => {
    wrapper.vm.transaction.gasPrice = '10';
    wrapper.vm.transaction.gasLimit = '10';
    wrapper.vm.transaction.value = '10';
    expect(wrapper.vm.transaction.gasPrice).toBe('10');
    expect(wrapper.vm.transaction.gasLimit).toBe('10');
    expect(wrapper.vm.transaction.value).toBe('10');
  });
  it('sets contract data', () => {
    wrapper.setData({ selectedToken: 'AAA' });
    wrapper.vm.transaction.value = '10';
    expect(wrapper.vm.selectedTokenInfo).toBeTruthy();
    expect(wrapper.vm.selectedTokenInfo.address).toBe(
      '0xB6eD7644C69416d67B522e20bC294A9a9B405B31'
    );

    expect(wrapper.vm.transactionData.data).toBe(
      '0xa9059cbb000000000000000000000000b6ed7644c69416d67b522e20bc294a9a9b405b31000000000000000000000000000000000000000000000000000000003b9aca00'
    );
  });

  it('should validate data', async () => {
    wrapper = mount(Send, {
      store,
      localVue,
      computed: {
        transactionData: () => null,
        maxAmount: () => 2,
      },
    });

    const { errors, $nextTick } = wrapper.vm;
    
    wrapper.setData({
      transaction: {
        to: '',
        gasPrice: '900',
        gasLimit: '2200000000',
        value: '2.222222222222222222222222',
        data: 'asdfas',
      }
    })
    wrapper.find('input#address').trigger('blur');

    await $nextTick();

    expect(errors.first('address').includes('required')).toBeTruthy();
    expect(errors.first('price').includes('between')).toBeTruthy();
    expect(errors.first('limit').includes('between')).toBeTruthy();
    expect(errors.first('value').includes('decimal')).toBeTruthy();
    expect(errors.first('data').includes('hex')).toBeTruthy();

    wrapper.setData({
      transaction: {
        to: '123',
        gasPrice: '-90',
        gasLimit: '-22000',
        value: '-2.22222',
        data: '0x',
      }
    })

    await $nextTick();

    expect(errors.first('address').includes('not a valid')).toBeTruthy();
    expect(errors.first('price').includes('numeric')).toBeTruthy();
    expect(errors.first('limit').includes('numeric')).toBeTruthy();
    expect(errors.first('value').includes('between')).toBeTruthy();

    wrapper.setData({
      transaction: {
        to: '0xE824633E6d247e64ba2cD841D8270505770d53fE',
        gasPrice: '90',
        gasLimit: '22000',
        value: '1.5',
        // prettier-ignore
        data: '0xa9059cbb000000000000000000000000b6ed7644c69416d67b522e20bc294a9a9b405b31000000000000000000000000000000000000000000000000000000003b9aca00',
      }
    })

    await $nextTick();
    await $nextTick();

    expect(errors.has('address')).toBeFalsy();
    expect(errors.has('price')).toBeFalsy();
    expect(errors.has('limit')).toBeFalsy();
    expect(errors.has('value')).toBeFalsy();
    expect(errors.has('data')).toBeFalsy();
  });
});
