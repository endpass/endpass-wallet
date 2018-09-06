import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';

import { address } from '../../../fixtures/accounts';

import ImportFromPublicKey from '@/components/importWallet/ImportFromPublicKey';

import router from '@/router';

jest.mock('@/router', () => require('../../../__mocks__/router'));

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('ImportFromPublicKey', () => {
  let wrapper, actions;
  beforeEach(() => {
    actions = {
      addWalletWithPublicKey: jest.fn(),
    };
    const storeOptions = {
      modules: {
        accounts: {
          namespaced: true,
          actions,
        },
      },
    };
    const store = new Vuex.Store(storeOptions);
    wrapper = shallow(ImportFromPublicKey, {
      localVue,
      store,
    });
  });
  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('logic', () => {
    it('should call vuex addWalletWithPublicKey with correct arguments', () => {
      wrapper.setData({ address });
      wrapper.vm.addWallet();
      expect(actions.addWalletWithPublicKey.mock.calls[0][1]).toEqual(address);
    });

    it('should redirect to root after successful wallet creation', () => {
      wrapper.vm.addWallet();
      expect(router.push).toHaveBeenCalledWith('/');
    });

    it('should add error to field if failed to create wallet', () => {
      actions.addWalletWithPublicKey.mockImplementationOnce(() => {
        throw new Error();
      });
      wrapper.vm.addWallet();
      expect(wrapper.vm.errors.items[0]).toEqual({
        field: 'address',
        id: 'wrongAddress',
        msg: 'Address is invalid',
        // vee validate added field
        scope: null,
      });
    });
  });
});
