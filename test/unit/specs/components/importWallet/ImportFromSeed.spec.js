import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';
import UIComponents from '@endpass/ui';
import validation from '@/validation';

import ImportFromSeed from '@/components/importWallet/ImportFromSeed';

const localVue = createLocalVue();

localVue.use(validation);
localVue.use(Vuex);
localVue.use(VueRouter);
localVue.use(VeeValidate);
localVue.use(UIComponents);

jest.useFakeTimers();

describe('ImportFromSeed', () => {
  let wrapper;
  let actions;
  let router;

  beforeEach(() => {
    actions = {
      addHdPublicWallet: jest.fn(),
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
    wrapper = shallowMount(ImportFromSeed, {
      localVue,
      store,
      router,
      sync: false,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ImportFromSeed');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('handlePasswordConfirm', () => {
      const password = 'password';

      it('should call vuex addHdPublicWallet with correct arguments', done => {
        const key = 'key';

        expect.assertions(2);

        wrapper.setData({ key });
        wrapper.setMethods({
          addHdPublicWallet: jest.fn(),
        });

        wrapper.vm.handlePasswordConfirm(password).then(() => {
          expect(wrapper.vm.addHdPublicWallet).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.addHdPublicWallet).toBeCalledWith({
            key,
            password,
          });
          done();
        });

        jest.runAllTimers();
      });

      it('should toggle isCreating before and after wallet creation', done => {
        expect.assertions(4);

        wrapper.vm.handlePasswordConfirm(password).then(() => {
          expect(actions.addHdPublicWallet).toBeCalled();
          expect(wrapper.vm.isCreating).toBe(false);
          done();
        });

        expect(actions.addHdPublicWallet).not.toBeCalled();
        expect(wrapper.vm.isCreating).toBe(true);
        jest.runAllTimers();
      });

      it('should add error to field if failed to create wallet', done => {
        expect.assertions(1);

        actions.addHdPublicWallet.mockImplementationOnce(() => {
          throw new Error();
        });

        wrapper.vm.handlePasswordConfirm(password).then(() => {
          expect(wrapper.vm.errors.items[0]).toEqual({
            field: 'hdkeyPhrase',
            msg: 'Seed phrase is invalid',
            id: 'wrongPhrase',
            // vee validate added field
            scope: null,
          });
          done();
        });
        jest.runAllTimers();
      });
    });

    describe('handleInput', () => {
      it('should clear error with wrongAddress id', () => {
        wrapper.vm.errors.add({
          field: 'hdkeyPhrase',
          msg: 'Seed phrase is invalid',
          id: 'wrongPhrase',
        });
        expect(wrapper.vm.errors.has('hdkeyPhrase')).toBe(true);

        wrapper.vm.handleInput();
        expect(wrapper.vm.errors.has('hdkeyPhrase')).toBe(false);
      });
    });
  });
});
