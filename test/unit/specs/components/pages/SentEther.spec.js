import Vue from 'vue';
import Vuex from 'vuex';
import web3 from 'web3';
import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import validation from '@/validation';

import SendEther from '@/components/pages/Send.vue';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('SendEther', () => {
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
    wrapper = shallow(SendEther, { store, localVue });
  });
  it('sets correct data', () => {
    wrapper.vm.gasPrice = '10';
    wrapper.vm.gasLimit = '10';
    wrapper.vm.value = '10';
    expect(wrapper.vm.gasPrice).toBe('10');
    expect(wrapper.vm.gasLimit).toBe('10');
    expect(wrapper.vm.value).toBe('10');
  });
  it('sets contract data', () => {
    wrapper.setData({ selectedToken: 'AAA' });
    wrapper.vm.value = '10';
    expect(wrapper.vm.selectedTokenInfo).toBeTruthy();
    expect(wrapper.vm.selectedTokenInfo.address).toBe(
      '0xB6eD7644C69416d67B522e20bC294A9a9B405B31'
    );

    wrapper.vm.createTokenTransaction();
    expect(wrapper.vm.transaction.data).toBe(
      '0xa9059cbb000000000000000000000000b6ed7644c69416d67b522e20bc294a9a9b405b31000000000000000000000000000000000000000000000000000000003b9aca00'
    );
  });
});
