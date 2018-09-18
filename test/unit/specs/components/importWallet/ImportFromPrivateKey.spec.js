import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';

import { generateStubs } from '@/utils/testUtils';
import { privateKeyString, v3password } from '../../../fixtures/accounts';

import ImportFromPrivateKey from '@/components/importWallet/ImportFromPrivateKey';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);
localVue.use(VueRouter);

jest.useFakeTimers();
describe('ImportFromPrivateKey', () => {
  let wrapper, actions, router;
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
    router = new VueRouter();
    wrapper = shallow(ImportFromPrivateKey, {
      localVue,
      store,
      stubs: generateStubs(ImportFromPrivateKey),
      router,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ImportFromPrivateKey');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('handlePasswordConfirm', () => {
      const password = 'password';

      it('should call vuex addWalletWithPrivateKey with correct arguments', done => {
        const privateKey = '0xprivateKey';
        const expectedPrivateKey = privateKey.replace(/^0x/, '');

        expect.assertions(2);

        wrapper.setData({ privateKey });
        wrapper.setMethods({
          addWalletWithPrivateKey: jest.fn(),
        });

        wrapper.vm.handlePasswordConfirm(password).then(() => {
          expect(wrapper.vm.addWalletWithPrivateKey).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.addWalletWithPrivateKey).toBeCalledWith({
            privateKey: expectedPrivateKey,
            password,
          });
          done();
        });

        jest.runAllTimers();
      });

      it('should redirect to root after successful wallet creation', done => {
        expect.assertions(2);

        router.push('/kek');

        expect(router.currentRoute.fullPath).toBe('/kek');
        wrapper.vm.handlePasswordConfirm(password).then(() => {
          expect(router.currentRoute.fullPath).toBe('/');
          done();
        });

        jest.runAllTimers();
      });

      it('should toggle isCreating before and after wallet creation', done => {
        expect.assertions(4);

        wrapper.vm.handlePasswordConfirm(password).then(() => {
          expect(actions.addWalletWithPrivateKey).toBeCalled();
          expect(wrapper.vm.isCreating).toBe(false);
          done();
        });

        expect(actions.addWalletWithPrivateKey).not.toBeCalled();
        expect(wrapper.vm.isCreating).toBe(true);

        jest.runAllTimers();
      });

      it('should add error to field if failed to create wallet', done => {
        expect.assertions(1);
        actions.addWalletWithPrivateKey.mockImplementationOnce(() => {
          throw new Error();
        });
        wrapper.vm.handlePasswordConfirm().catch(() => {
          expect(wrapper.vm.errors.items[0]).toEqual({
            field: 'privateKey',
            msg: 'Private key is invalid',
            id: 'wrongPrivateKey',
            // vee validate added field
            scope: null,
          });
          done();
        });
        jest.runAllTimers();
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
