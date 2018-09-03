import { shallow, createLocalVue } from '@vue/test-utils';

import Vuex from 'vuex';
const localVue = createLocalVue();

localVue.use(Vuex);

import NavSidebar from '@/components/NavSidebar';

describe('NavSidebar', () => {
  describe('render', () => {
    let wrapper;
    beforeEach(() => {
      const storeOptions = {
        modules: {
          accounts: {
            namespaced: true,
            actions: {
              logout: jest.fn(),
            },
            getters: {
              isPublicAccount: jest.fn(),
              isLoggedIn: jest.fn(),
            },
          },
          user: {
            namespaced: true,
            getters: {
              isLoggedOut: jest.fn(),
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

    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });
});
