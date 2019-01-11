import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { shallow, createLocalVue, mount } from '@vue/test-utils';

import PasswordModal from '@/components/modal/PasswordModal';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('PasswordModal', () => {
  let wrapper;
  let store;
  let options;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        accounts: {},
      },
    });

    options = {
      store,
      localVue,
      methods: {
        validatePassword: () => null,
      },
    };
  });

  describe('render', () => {
    beforeEach(() => {
      wrapper = shallow(PasswordModal, {
        ...options,
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('PasswordModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
