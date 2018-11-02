import { shallow, createLocalVue } from '@vue/test-utils';

import Vuex from 'vuex';
const localVue = createLocalVue();

localVue.use(Vuex);
import InfoBar from '@/components/bar/InfoBar';

describe('InfoBar', () => {
  describe('render', () => {
    let wrapper;
    beforeEach(() => {
      let storeOptions = {
        state: {
          web3: {
            activeNet: 1,
          },
        },
        modules: {
          user: {
            namespaced: true,
            state: {
              settings: {},
            },
          },
          accounts: {
            namespaced: true,
            getters: {
              balance: jest.fn(),
            },
          },
          price: {
            namespaced: true,
            actions: {
              updatePrice: jest.fn(),
            },
            state: {
              price: '0',
              isLoading: false,
            },
          },
          web3: {
            namespaced: true,
            state: {
              activeNet: 1,
              activeCurrency: 'KEK',
            },
          },
        },
      };
      const mixins = {
        net: {
          activeNet: 1,
        },
      };
      const store = new Vuex.Store(storeOptions);
      wrapper = shallow(InfoBar, {
        localVue,
        store,
        mixins,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('InfoBar');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
