import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import Notifications from 'vue-notification';
import UIComponents from '@endpass/ui';
import EmailUpdate from '@/components/EmailUpdate';

describe('EmailUpdate', () => {
  let userActions;
  let storeOptions;
  let wrapper;

  beforeEach(() => {
    userActions = {
      updateEmail: jest.fn(),
    };
    storeOptions = {
      modules: {
        user: {
          namespaced: true,
          actions: userActions,
        },
      },
    };
    const localVue = createLocalVue();

    localVue.use(Vuex);
    localVue.use(Notifications);
    localVue.use(VeeValidate);
    localVue.use(UIComponents);

    const store = new Vuex.Store(storeOptions);

    wrapper = shallowMount(EmailUpdate, {
      store,
      localVue,
      sync: false,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('EmailUpdate');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    describe('email field', () => {
      it('should disable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: true,
        });

        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-input-stub[data-test=input-new-email]').attributes()
            .disabled,
        ).toBeTruthy();
      });

      it('should enable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: false,
        });

        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-input-stub[data-test=input-new-email]').attributes()
            .disabled,
        ).toBeUndefined();
      });
    });

    describe('confirm field', () => {
      it('should disable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: true,
        });

        await wrapper.vm.$nextTick();

        expect(
          wrapper
            .find('v-input-stub[data-test=input-confirm-new-email]')
            .attributes().disabled,
        ).toBeTruthy();
      });

      it('should enable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: false,
        });

        await wrapper.vm.$nextTick();

        expect(
          wrapper
            .find('v-input-stub[data-test=input-confirm-new-email]')
            .attributes().disabled,
        ).toBeUndefined();
      });
    });

    describe('button', () => {
      it('should show loader', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: true,
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.find('v-button-stub').attributes().loading).toBeTruthy();
      });

      it('should not show loader', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: false,
        });

        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-button-stub').attributes().loading,
        ).toBeUndefined();
      });
    });

    describe('password modal', () => {
      it('should toggle password modal', async () => {
        expect.assertions(2);

        wrapper.vm.togglePasswordModal();
        await wrapper.vm.$nextTick();
        expect(wrapper.find('password-modal-stub').exists()).toBeTruthy();

        wrapper.vm.togglePasswordModal();
        await wrapper.vm.$nextTick();
        expect(wrapper.find('password-modal-stub').exists()).toBeFalsy();
      });
    });
  });

  describe('behavior', () => {
    const email = 'kek@google.com';
    const emailConfirm = 'kek@google.com';

    describe('form', () => {
      it('should open confirm window', async () => {
        expect.assertions(1);

        wrapper.setData({
          email,
          emailConfirm,
        });

        wrapper.find('v-form-stub').vm.$emit('submit');

        await wrapper.vm.$nextTick();

        expect(wrapper.find('password-modal-stub').exists()).toBeTruthy();
      });
    });

    describe('password modal', () => {
      beforeEach(async () => {
        jest.spyOn(wrapper.vm, '$notify');

        wrapper.setData({
          email,
          emailConfirm,
          isPasswordModal: true,
        });

        await wrapper.vm.$nextTick();
      });

      it('should update email', async () => {
        expect.assertions(7);
        const password = '123';
        await wrapper.vm.$nextTick();
        wrapper.find('password-modal-stub').vm.$emit('confirm', password);

        expect(wrapper.vm.isLoading).toBe(true);

        await wrapper.vm.$nextTick();

        expect(userActions.updateEmail).toHaveBeenCalledTimes(1);
        expect(userActions.updateEmail).toHaveBeenCalledWith(
          expect.any(Object),
          { email, password },
          undefined,
        );
        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.isLoading).toBe(false);
        expect(wrapper.vm.email).toBe(null);
        expect(wrapper.vm.emailConfirm).toBe(null);
      });

      it('should close password modal', async () => {
        expect.assertions(1);

        wrapper.find('password-modal-stub').vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('password-modal-stub').exists()).toBeFalsy();
      });
    });
  });
});
