import { shallow, createLocalVue } from '@vue/test-utils';

import Vuex from 'vuex';
const localVue = createLocalVue();

localVue.use(Vuex);

import NavSidebar from '@/components/NavSidebar';

describe('NavSidebar', () => {
  let wrapper;
  beforeEach(() => {
    const storeOptions = {
      modules: {
        user: {
          namespaced: true,
          getters: {
            isLoggedIn: jest.fn(),
            isLoggedOut: jest.fn(),
          },
        },
        accounts: {
          namespaced: true,
          actions: {
            logout: jest.fn(),
          },
          getters: {
            isPublicAccount: jest.fn(),
          },
        },
      },
    };
    const store = new Vuex.Store(storeOptions);
    wrapper = shallow(NavSidebar, {
      localVue,
      store,
    });
  });
  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('NavSidebar');
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('toggleNavMenu', () => {
      it('should toggle navMenuActive', () => {
        wrapper.vm.toggleNavMenu();
        expect(wrapper.vm.navMenuActive).toBe(true);
        wrapper.vm.toggleNavMenu();
        expect(wrapper.vm.navMenuActive).toBe(false);
      });
    });

    describe('closeNavMenu', () => {
      it('should set navMenuActive to false', () => {
        wrapper.vm.closeNavMenu();
        expect(wrapper.vm.navMenuActive).toBe(false);
      });
    });

    describe('openNewAccountModal', () => {
      it('should set newAccountModalOpen to true', () => {
        wrapper.vm.openNewAccountModal();
        expect(wrapper.vm.newAccountModalOpen).toBe(true);
      });
    });

    describe('closeNewAccountModal', () => {
      it('should set newAccountModalOpen to false', () => {
        wrapper.vm.closeNewAccountModal();
        expect(wrapper.vm.newAccountModalOpen).toBe(false);
      });
    });
  });
});
