import Vue from 'vue';
import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import HDKey from 'ethereumjs-wallet/hdkey';
import ImportFromSeed from '@/components/importWallet/ImportFromSeed';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('ImportFromSeed', () => {
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
    wrapper = shallow(ImportFromSeed, { store, localVue });
  });

  it('sets the correct default data', () => {
    expect(wrapper.vm.$data.hdkeyPhrase).toBe('');
  });

  it('correctly creates wallet with prase', () => {
    wrapper.setData({
      hdkeyPhrase:
        'salt suit force stomach lounge endless soul junk join leg sort aware',
    });

    const key = wrapper.vm.createWalletWithPrase();
    const wallet = key.deriveChild(0).getWallet();

    expect(key instanceof HDKey).toBe(true);
    expect(wallet.getAddressString()).toBe(
      '0x4ce2109f8db1190cd44bc6554e35642214fbe144'
    );
  });

  it('correctly sets error with bad phrase', async () => {
    await expect(wrapper.vm.addWalletWithPhrase()).rejects.toThrow();
    expect(wrapper.vm.errors.has('hdkeyPhrase')).toBe(true);
  });
});
