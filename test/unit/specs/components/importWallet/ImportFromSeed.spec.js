import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import VueRouter from 'vue-router';

import { generateStubs } from '@/utils/testUtils';

import ImportFromSeed from '@/components/importWallet/ImportFromSeed';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VueRouter);
localVue.use(VeeValidate);

jest.useFakeTimers();

describe('ImportFromSeed', () => {
  let wrapper;
  let actions;
  let router;

  beforeEach(() => {
    actions = {
      addMultiHdWallet: jest.fn(),
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
    wrapper = shallow(ImportFromSeed, {
      localVue,
      store,
      router,
      stubs: generateStubs(ImportFromSeed),
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

      it('should call vuex addMultiHdWallet with correct arguments', done => {
        const key = 'key';

        expect.assertions(2);

        wrapper.setData({ key });
        wrapper.setMethods({
          addMultiHdWallet: jest.fn(),
        });

        wrapper.vm.handlePasswordConfirm(password).then(() => {
          expect(wrapper.vm.addMultiHdWallet).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.addMultiHdWallet).toBeCalledWith({ key, password });
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
          expect(actions.addMultiHdWallet).toBeCalled();
          expect(wrapper.vm.isCreating).toBe(false);
          done();
        });

        expect(actions.addMultiHdWallet).not.toBeCalled();
        expect(wrapper.vm.isCreating).toBe(true);
        jest.runAllTimers();
      });

      it('should add error to field if failed to create wallet', done => {
        expect.assertions(1);

        actions.addMultiHdWallet.mockImplementationOnce(() => {
          throw new Error();
        });

        wrapper.vm.handlePasswordConfirm(password).catch(() => {
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
