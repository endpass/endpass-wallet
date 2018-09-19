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
  let wrapper, actions, router;
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
    describe('addWallet', () => {
      it('should call vuex addMultiHdWallet with correct arguments', done => {
        const data = {
          key: 'kek',
          password: 'kek',
        };

        expect.assertions(1);

        wrapper.setData(data);
        wrapper.vm.submitAddWallet().then(() => {
          expect(actions.addMultiHdWallet).toBeCalledWith(
            expect.any(Object),
            data,
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
          expect(actions.addMultiHdWallet).toBeCalled();
          expect(wrapper.vm.isCreating).toBe(false);
          done();
        });

        expect(actions.addMultiHdWallet).not.toBeCalled();
        expect(wrapper.vm.isCreating).toBe(true);
        jest.runAllTimers();
      });

      it('should add error to field if failed to create wallet', done => {
        actions.addMultiHdWallet.mockImplementationOnce(() => {
          throw new Error();
        });
        wrapper.vm.submitAddWallet().catch(() => {
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

        expect.assertions(1);
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
