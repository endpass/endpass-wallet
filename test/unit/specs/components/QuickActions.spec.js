import { shallow, createLocalVue } from '@vue/test-utils';

import Vuex from 'vuex';
const localVue = createLocalVue();

localVue.use(Vuex);

import QuickActions from '@/components/QuickActions';

describe('QuickActions', () => {
  let wrapper;
  beforeEach(() => {
    let storeOptions = {
      modules: {
        accounts: {
          namespaced: true,
          state: {
            wallet: null,
            address: null,
          },
          getters: {
            isPublicAccount: jest.fn(),
          },
        },
      },
    };
    const store = new Vuex.Store(storeOptions);
    wrapper = shallow(QuickActions, {
      localVue,
      store,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
      expect(wrapper.name()).toBe('QuickActions');
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
