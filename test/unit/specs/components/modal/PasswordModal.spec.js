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
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = shallow(PasswordModal, {
        ...options,
      });
    });

    it('should validate the password', async () => {
      wrapper = mount(PasswordModal, {
        ...options,
        methods: {
          validatePassword: () => Promise.resolve(),
        },
      });

      await wrapper.vm.confirm();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.errors.has('jsonKeystorePassword')).toBeFalsy();
      expect(wrapper.contains('.is-danger')).toBeFalsy();

      wrapper.vm.validatePassword = () => Promise.reject();

      await wrapper.vm.confirm();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.errors.has('jsonKeystorePassword')).toBeTruthy();
      expect(wrapper.contains('.is-danger')).toBeTruthy();
    });
  });
});
