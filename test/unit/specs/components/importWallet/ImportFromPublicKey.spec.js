import Vue from 'vue';
import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import AddressWallet from '@/services/addressWallet.js';
import ImportFromPublicKey from '@/components/importWallet/ImportFromPublicKey';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('ImportFromPublicKey', () => {
  let actions;
  let store;
  let wrapper;

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        accounts: {},
      },
      actions,
    });
    wrapper = shallow(ImportFromPublicKey, { store, localVue });
  });

  it('sets the correct default data', () => {
    expect(wrapper.vm.$data.address).toBe('');
  });

  it('correctly creates wallet with address', () => {
    wrapper.setData({
      address: '0x2f015c60e0be116b1f0cd534704db9c92118fb6a',
    });

    const wallet = wrapper.vm.createWalletWithAddress();

    expect(wallet instanceof AddressWallet).toBe(true);
    expect(wallet.getAddressString()).toEqual(wrapper.vm.address);
  });

  it('correctly sets error with bad address', async () => {
    await expect(wrapper.vm.addWalletWithAddress()).rejects.toThrow();
    expect(wrapper.vm.errors.has('address')).toBe(true);
  });
});
