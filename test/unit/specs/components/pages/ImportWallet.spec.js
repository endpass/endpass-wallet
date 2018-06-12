import Vue from 'vue';
import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import ImportWallet from '@/components/pages/ImportWallet.vue';
import LocalStorageMock from '../../../localStorageMock.js';
import ImportFromPrivateKey from '@/components/importWallet/ImportFromPrivateKey';
import ImportFromSeed from '@/components/importWallet/ImportFromSeed';

global.localStorage = LocalStorageMock;

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('ImportWallet', () => {
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
    wrapper = shallow(ImportWallet, { store, localVue });
  });

  it('defaults to import by seed phrase', () => {
    expect(wrapper.vm.importType).toBe('seedPhrase');
    expect(wrapper.find(ImportFromSeed).exists()).toBeTruthy();
    expect(wrapper.find(ImportFromPrivateKey).exists()).toBeFalsy();
  });

  it('shows import by private key', () => {
    wrapper.setData({ importType: 'privateKey' });

    expect(wrapper.find(ImportFromSeed).exists()).toBeFalsy();
    expect(wrapper.find(ImportFromPrivateKey).exists()).toBeTruthy();
  });
});
