import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import Notifications from 'vue-notification';
import { shallowMount, createLocalVue, mount } from '@vue/test-utils';
import UIComponents from '@endpass/ui';

import PasswordModal from '@/components/modal/PasswordModal';
import validation from '@/validation';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(Notifications);
localVue.use(UIComponents);

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
      wrapper = shallowMount(PasswordModal, {
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
      wrapper = mount(PasswordModal, {
        ...options,
      });
    });

    it('should validate the password', async () => {
      expect.assertions(3);

      wrapper = mount(PasswordModal, {
        ...options,
        methods: {
          validatePassword: () => Promise.resolve(),
        },
        sync: false,
      });

      await wrapper.vm.confirm();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.errors.has('jsonKeystorePassword')).toBeFalsy();
      expect(wrapper.contains('.is-danger')).toBeFalsy();

      wrapper.vm.validatePassword = () => Promise.reject();

      await wrapper.vm.confirm();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.errors.has('jsonKeystorePassword')).toBeTruthy();

      // TODO: expect not working after update to vue-test@1.0.0-beta.28. Need make to work it correctly
      // expect(wrapper.contains('.is-danger')).toBeTruthy();
    });

    it('should have button that submits form', () => {
      expect(wrapper.find('form').attributes().id).toBe('password-form');
      expect(
        wrapper.find('[data-test=submit-password]').attributes().form,
      ).toBe('password-form');
    });
  });
});
