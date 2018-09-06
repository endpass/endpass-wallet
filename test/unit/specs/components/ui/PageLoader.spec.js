import { shallow, createLocalVue } from '@vue/test-utils';

import VForm from '@/components/ui/form/VForm';

const localVue = createLocalVue();

localVue.use(Vuex);

describe('VForm page', () => {
  let wrapper, state;

  const storeOptions = {
    state: {
      isPageLoading: true,
    },
  };
  const store = new Vuex.Store(storeOptions);
  beforeEach(() => {
    wrapper = shallow(VForm, {
      localVue,
      store,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });
});
