import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';

import { generateStubs } from '@/utils/testUtils';
import { privateKeyString, v3password } from '../../../fixtures/accounts';

import ImportFromPrivateKey from '@/components/importWallet/ImportFromPrivateKey';

import router from '@/router';

jest.mock('@/router', () => require('../../../__mocks__/router'));

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

jest.useFakeTimers();
describe('ImportFromPrivateKey', () => {
  let wrapper, actions;
  beforeEach(() => {
    actions = {
      addWalletWithPrivateKey: jest.fn(),
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
    wrapper = shallow(ImportFromPrivateKey, {
      localVue,
      store,
      stubs: generateStubs(ImportFromPrivateKey),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('addWallet', () => {
      it('should call vuex addWalletWithPrivateKey with correct arguments', async () => {
        const data = {
          privateKey: '0xkek',
          password: 'kek',
        };
        wrapper.setData(data);
        wrapper.vm.addWallet();
        await jest.runAllTimers();
        expect(actions.addWalletWithPrivateKey.mock.calls[0][1]).toEqual({
          privateKey: data.privateKey.replace(/^0x/, ''),
          password: data.password,
        });
        expect.assertions(1);
      });

      it('should redirect to root after successful wallet creation', async () => {
        wrapper.vm.addWallet();
        await jest.runAllTimers();
        expect(router.push).toHaveBeenCalledWith('/');
        expect.assertions(1);
      });

      it('should toggle isCreating before and after wallet creation', async () => {
        wrapper.vm.addWallet();
        expect(actions.addWalletWithPrivateKey).not.toBeCalled();
        expect(wrapper.vm.isCreating).toBe(true);
        await jest.runAllTimers();
        expect(actions.addWalletWithPrivateKey).toBeCalled();
        expect(wrapper.vm.isCreating).toBe(false);
        expect.assertions(4);
      });

      it('should add error to field if failed to create wallet', async () => {
        actions.addWalletWithPrivateKey.mockImplementationOnce(() => {
          throw new Error();
        });
        wrapper.vm.addWallet();
        await jest.runAllTimers();
        expect(wrapper.vm.errors.items[0]).toEqual({
          field: 'privateKey',
          msg: 'Private key is invalid',
          id: 'wrongPrivateKey',
          // vee validate added field
          scope: null,
        });
        expect.assertions(1);
      });
    });
    describe('handleInput', () => {
      it('should clear error with wrongPrivateKey id', () => {
        wrapper.vm.errors.add({
          field: 'privateKey',
          msg: 'Private key is invalid',
          id: 'wrongPrivateKey',
        });
        expect(wrapper.vm.errors.has('privateKey')).toBe(true);
        wrapper.vm.handleInput();
        expect(wrapper.vm.errors.has('privateKey')).toBe(false);
      });
    });
  });
});
