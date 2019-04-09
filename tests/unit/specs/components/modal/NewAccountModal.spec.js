import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { mount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';

import NewAccountModal from '@/components/modal/NewAccountModal';
import validation from '@/validation';

const localVue = createLocalVue();

localVue.use(VeeValidate);
localVue.use(validation);
localVue.use(Vuex);
localVue.use(UIComponents);

describe('NewAccountModal', () => {
  let wrapper;
  let store;
  let options;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          state: {
            address: {
              getChecksumAddressString: () => null,
            },
            wallet: {},
            wallets: {},
          },
          actions: {
            generateWallet: () => {},
            validatePassword: () => {},
          },
        },
      },
    });

    const $ga = { event: jest.fn() };

    options = {
      store,
      localVue,
      mocks: {
        $ga,
      },
    };

    wrapper = mount(NewAccountModal, {
      ...options,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('NewAccountModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should redirect and close the modal for import', () => {
      const spy = jest.spyOn(wrapper.vm, 'close');
      const push = jest.fn();
      wrapper.vm.$router = { push };

      wrapper.vm.importNewAccount();

      expect(spy).toBeCalled();
      expect(push).toBeCalledWith('import');
    });

    it('should switch modals state', () => {
      expect(wrapper.vm.isPasswordModal).toBe(false);
      expect(wrapper.vm.isWalletsListModal).toBe(false);
    });
  });
});
