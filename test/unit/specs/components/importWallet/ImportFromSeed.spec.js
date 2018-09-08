import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';

import { generateStubs } from '@/utils/testUtils';

import ImportFromSeed from '@/components/importWallet/ImportFromSeed';

import router from '@/router';

jest.mock('@/router', () => require('../../../__mocks__/router'));

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

jest.useFakeTimers();
describe('ImportFromSeed', () => {
  let wrapper, actions;
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
    const store = new Vuex.Store(storeOptions);
    wrapper = shallow(ImportFromSeed, {
      localVue,
      store,
      stubs: generateStubs(ImportFromSeed),
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
      it('should call vuex addMultiHdWallet with correct arguments', async () => {
        const data = {
          key: 'kek',
          password: 'kek',
        };
        wrapper.setData(data);
        wrapper.vm.addWallet();
        await jest.runAllTimers();
        expect(actions.addMultiHdWallet.mock.calls[0][1]).toEqual(data);
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
        expect(actions.addMultiHdWallet).not.toBeCalled();
        expect(wrapper.vm.isCreating).toBe(true);
        await jest.runAllTimers();
        expect(actions.addMultiHdWallet).toBeCalled();
        expect(wrapper.vm.isCreating).toBe(false);
        expect.assertions(4);
      });

      it('should add error to field if failed to create wallet', async () => {
        actions.addMultiHdWallet.mockImplementationOnce(() => {
          throw new Error();
        });
        wrapper.vm.addWallet();
        await jest.runAllTimers();
        expect(wrapper.vm.errors.items[0]).toEqual({
          field: 'hdkeyPhrase',
          msg: 'Seed phrase is invalid',
          id: 'wrongPhrase',
          // vee validate added field
          scope: null,
        });
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
