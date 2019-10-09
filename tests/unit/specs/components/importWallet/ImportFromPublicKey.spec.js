import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';
import UIComponents from '@endpass/ui';
import { address } from 'fixtures/accounts';
import validation from '@/validation';
import setupI18n from '@/locales/i18nSetup';


import ImportFromPublicKey from '@/components/importWallet/ImportFromPublicKey';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(validation);
localVue.use(Vuex);
localVue.use(VeeValidate);
localVue.use(VueRouter);
localVue.use(UIComponents);

describe('ImportFromPublicKey', () => {
  let wrapper;
  let actions;
  let router;
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
    router = new VueRouter();
    const store = new Vuex.Store(storeOptions);
    wrapper = shallowMount(ImportFromPublicKey, {
      localVue,
      store,
      i18n,
      router,
      sync: false,
    });
  });
  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ImportFromPublicKey');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('addWallet', () => {
      it('should call vuex addWalletWithPublicKey with correct arguments', () => {
        wrapper.setData({ address });
        wrapper.vm.submitAddWallet();

        expect(actions.addWalletWithPublicKey).toBeCalledWith(
          expect.any(Object),
          address,
          undefined,
        );
      });

      it('should redirect to root after successful wallet creation', async () => {
        expect.assertions(2);

        router.push('/kek');
        expect(router.currentRoute.fullPath).toBe('/kek');

        await wrapper.vm.submitAddWallet();
        expect(router.currentRoute.fullPath).toBe('/');
      });

      it('should add error to field if failed to create wallet', () => {
        expect.assertions(1);

        actions.addWalletWithPublicKey.mockImplementationOnce(() => {
          throw new Error();
        });
        wrapper.vm.submitAddWallet();

        expect(wrapper.vm.errors.items[0]).toMatchObject({
          field: 'address',
          id: 'wrongAddress',
          msg: 'Address is invalid',
        });
      });
    });

    describe('handleInput', () => {
      it('should clear error with wrongAddress id', () => {
        wrapper.vm.errors.add({
          field: 'address',
          msg: 'Address is invalid',
          id: 'wrongAddress',
        });
        expect(wrapper.vm.errors.has('address')).toBe(true);

        wrapper.vm.handleInput();
        expect(wrapper.vm.errors.has('address')).toBe(false);
      });
    });
  });
});
