import { shallow, createLocalVue } from '@vue/test-utils';

import Vuex from 'vuex';
import PageLoader from '@/components/ui/PageLoader';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('PageLoader page', () => {
  let wrapper, state;

  const storeOptions = {
    state: {
      isPageLoading: true,
    },
  };
  const store = new Vuex.Store(storeOptions);
  beforeEach(() => {
    wrapper = shallow(PageLoader, {
      localVue,
      store,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('PageLoader');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
