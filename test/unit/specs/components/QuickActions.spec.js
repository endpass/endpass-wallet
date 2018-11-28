import Vuex from 'vuex';
import { shallow, createLocalVue } from '@vue/test-utils';
import QuickActions from '@/components/QuickActions';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('QuickActions', () => {
  let wrapper;
  beforeEach(() => {
    const storeOptions = {
      modules: {
        accounts: {
          namespaced: true,
          state: {
            address: null,
          },
          getters: {
            wallet: () => null,
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
