import Vuex from 'vuex';
import { shallow, createLocalVue, mount } from '@vue/test-utils';

import NewAccountModal from '@/components/modal/NewAccountModal';

const localVue = createLocalVue();

localVue.use(Vuex);

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

    options = {
      store,
      localVue,
    };

    wrapper = shallow(NewAccountModal, {
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
  });
});
