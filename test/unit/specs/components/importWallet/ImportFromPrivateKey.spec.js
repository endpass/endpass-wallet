import Vue from 'vue';
import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import EthWallet from 'ethereumjs-wallet';
import ImportFromPrivateKey from '@/components/importWallet/ImportFromPrivateKey';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('ImportFromPrivateKey', () => {
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
    wrapper = shallow(ImportFromPrivateKey, { store, localVue });
  });

  it('sets the correct default data', () => {
    expect(wrapper.vm.$data.privateKey).toBe('');
  });

  it('correctly creates wallet with private key', () => {
    wrapper.setData({
      privateKey:
        '4daf66f4ffed6d47e75d22e2c962d1f9a36550dc2cfda4bfb5da741bdc97d6ba',
    });
    expect(wrapper.vm.createWalletWithPrivateKey() instanceof EthWallet).toBe(
      true
    );
  });

  it('correctly sets error with private bad key', async () => {
    await expect(wrapper.vm.addWalletWithPrivateKey()).rejects.toThrow();
    expect(wrapper.vm.errors.has('privateKey')).toBe(true);
  });
});
