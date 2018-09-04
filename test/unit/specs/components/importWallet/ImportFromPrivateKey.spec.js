import { shallow, mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import ImportFromPrivateKey from '@/components/importWallet/ImportFromPrivateKey';

jest.mock('@/router', () => require('../../../__mocks__/router'));

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

jest.useFakeTimers();

describe('ImportFromPrivateKey', () => {
  let wrapper;
  describe('render', () => {
    beforeEach(() => {
      const storeOptions = {
        modules: {
          accounts: {
            namespaced: true,
            actions: {
              addWalletWithPrivateKey: jest.fn(),
            },
          },
        },
      };
      const store = new Vuex.Store(storeOptions);
      wrapper = shallow(ImportFromPrivateKey, {
        localVue,
        store,
      });
    });
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('logic', () => {
    const storeOptions = {
      modules: {
        namespaced: true,
        accounts: {
          actions: {
            addWalletWithPrivateKey: jest.fn(),
          },
        },
      },
    };
    beforeEach(() => {
      const store = new Vuex.Store(storeOptions);
      wrapper = shallow(ImportFromPrivateKey, {
        localVue,
        store,
      });
    });
    it('should call vuex addWalletWithPrivateKey with correct arguments', () => {
      const privateKey =
        '0x87d420caef41c44aa6f54fe5adb8a1a593c1d07625dda3e66482090a41c86c8a';
      const walletPassword = 'kekkek';
      wrapper.setData({
        privateKey,
        walletPassword,
      });
      wrapper.find('v-button').trigger('click');
      expect(
        storeOptions.modules.accounts.actions.addWalletWithPrivateKey,
      ).toHaveBeenCalledTimes(1);
      expect(
        storeOptions.modules.accounts.actions.addWalletWithPrivateKey,
      ).toHaveBeenCalledWith({
        privateKey: privateKey.replace(/^0x/, ''),
        password: walletPassword,
      });
    });
  });
});
