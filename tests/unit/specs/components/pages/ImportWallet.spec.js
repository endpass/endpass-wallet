import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';
import ImportWallet from '@/components/pages/ImportWallet.vue';
import validation from '@/validation';

import setupI18n from '@/locales/i18nSetup';
import ImportFromPrivateKey from '@/components/importWallet/ImportFromPrivateKey';
import ImportFromSeed from '@/components/importWallet/ImportFromSeed';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(Vuex);
localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);

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
    wrapper = mount(ImportWallet, {
      store,
      localVue,
      i18n,
      sync: false,
    });
  });

  it('defaults to import by seed phrase', () => {
    expect(wrapper.vm.importType).toBe('seedPhrase');
    expect(wrapper.find(ImportFromSeed).exists()).toBeTruthy();
    expect(wrapper.find(ImportFromPrivateKey).exists()).toBeFalsy();
  });

  it('shows import by private key', async () => {
    expect.assertions(2);

    wrapper.setData({ importType: 'privateKey' });

    await wrapper.vm.$nextTick();

    expect(wrapper.find(ImportFromSeed).exists()).toBeFalsy();
    expect(wrapper.find(ImportFromPrivateKey).exists()).toBeTruthy();
  });
});
