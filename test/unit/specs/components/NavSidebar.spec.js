import Vuex from 'vuex';
import VueRouter from 'vue-router';
import { createLocalVue } from '@vue/test-utils';
import { wrapShallowMountFactory } from '@/testUtils';

import NavSidebar from '@/components/NavSidebar';

const localVue = createLocalVue();

localVue.use(VueRouter);
localVue.use(Vuex);

describe('NavSidebar', () => {
  let wrapper;
  let wrapperFactory;
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
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
            wallet: jest.fn().mockReturnValue(null),
            isPublicAccount: jest.fn().mockReturnValue(true),
          },
        },
      },
    });
    wrapperFactory = wrapShallowMountFactory(NavSidebar, {
      localVue,
      store,
    });
    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('NavSidebar');
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should not render items for private account if current account is public', () => {
      wrapper = wrapperFactory();

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
