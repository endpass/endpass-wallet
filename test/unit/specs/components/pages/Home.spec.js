import { shallow } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { generateStubs } from '@/utils/testUtils';

import Home from '@/components/pages/Home';

describe('Home page', () => {
  let wrapper;
  beforeEach(() => {
    const store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          getters: {
            isLoggedIn: () => true,
          },
        },
        accounts: {
          namespaced: true,
          getters: {
            isPublicAccount: jest.fn(),
            isLoggedIn: jest.fn(),
            balance: jest.fn(),
          },
        },
        web3: {
          namespaced: true,
          state: {},
        },
      },
    });
    wrapper = shallow(Home, {
      store,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('home');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
