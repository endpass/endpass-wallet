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
      expect(wrapper.name()).toBe('import-from-private-key');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('addWallet', () => {
      it('should call vuex addWalletWithPrivateKey with correct arguments', done => {
        const data = {
          privateKey: '0xkek',
          password: 'kek',
        };

        expect.assertions(1);

        wrapper.setData(data);
        wrapper.vm.submitAddWallet().then(() => {
          expect(actions.addWalletWithPrivateKey).toBeCalledWith(
            expect.any(Object),
            expect.objectContaining({
              privateKey: data.privateKey.replace(/^0x/, ''),
              password: data.password,
            }),
            undefined,
          );
          done();
        });
        jest.runAllTimers();
      });

      it('should redirect to root after successful wallet creation', done => {
        expect.assertions(2);
        router.push('/kek');
        expect(router.currentRoute.fullPath).toBe('/kek');
        wrapper.vm.submitAddWallet().then(() => {
          expect(router.currentRoute.fullPath).toBe('/');
          done();
        });
        jest.runAllTimers();
      });

      it('should toggle isCreating before and after wallet creation', done => {
        expect.assertions(4);
        wrapper.vm.submitAddWallet().then(() => {
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
        wrapper.vm.submitAddWallet().catch(() => {
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
