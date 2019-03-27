import { createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import UIComponents from '@endpass/ui';
import { wrapShallowMountFactory } from '@/testUtils';

import TwoFactorAuthSettings from '@/components/TwoFactorAuthSettings';

describe('TwoFactorAuthSettings', () => {
  let localVue;
  let store;

  const userActions = {
    getOtpSettings: jest.fn(),
    setOtpSettings: jest.fn(),
    deleteOtpSettings: jest.fn(),
  };
  const errorsActions = {
    emitError: jest.fn(),
  };
  const storeOptions = {
    modules: {
      user: {
        namespaced: true,
        state: {
          email: 'email',
          otpSettings: {
            secret: null,
            status: null,
          },
        },
        actions: userActions,
      },
      errors: {
        namespaced: true,
        actions: errorsActions,
      },
    },
  };
  let wrapper;
  let wrapFactory;

  beforeEach(() => {
    localVue = createLocalVue();

    localVue.use(Vuex);
    localVue.use(Notifications);
    localVue.use(UIComponents);

    store = new Vuex.Store(storeOptions);

    wrapFactory = wrapShallowMountFactory(TwoFactorAuthSettings, {
      store,
      localVue,
    });

    wrapper = wrapFactory();
  });

  describe('render', () => {
    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should correctly render button text', () => {
      wrapper = wrapFactory({
        computed: {
          otpSettings: {
            secret: 'secret',
          },
        },
      });

      expect(wrapper.find('v-button-stub').text()).toBe(
        'Enable Two Factor Auth',
      );

      wrapper = wrapFactory({
        computed: {
          otpSettings: {
            secret: null,
          },
        },
      });

      expect(wrapper.find('v-button-stub').text()).toBe(
        'Disable Two Factor Auth',
      );
    });

    it('should correctly change button "disabled" property', () => {
      wrapper = wrapFactory({
        computed: {
          secret: null,
          status: null,
        },
      });

      expect(wrapper.find('v-button-stub').attributes().disabled).toBeTruthy();

      wrapper = wrapFactory({
        computed: {
          otpSettings: {
            secret: 'secret',
            status: null,
          },
        },
      });

      expect(wrapper.find('v-button-stub').attributes().disabled).toBeFalsy();

      wrapper = wrapFactory({
        computed: {
          otpSettings: {
            secret: null,
            status: 'status',
          },
        },
      });

      expect(wrapper.find('v-button-stub').attributes().disabled).toBeFalsy();

      wrapper = wrapFactory({
        computed: {
          otpSettings: {
            secret: 'secret',
            status: 'status',
          },
        },
      });

      expect(wrapper.find('v-button-stub').attributes().disabled).toBeFalsy();
    });

    it('should correctly change button "loading" property', () => {
      wrapper.setData({
        isLoading: false,
      });
      expect(wrapper.find('v-button-stub').attributes().loading).toBeFalsy();

      wrapper.setData({
        isLoading: true,
      });
      expect(wrapper.find('v-button-stub').attributes().loading).toBeTruthy();
    });

    it('should show modal window for two factor auth', async () => {
      expect.assertions(1);

      wrapper.setData({
        isTwoFactorAuthModal: true,
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('handleFormSubmit', () => {
      it('should not call toggleTwoFactorAuthModal', () => {
        wrapper = wrapFactory({
          computed: {
            isButtonDisabled: true,
          },
        });

        spyOn(wrapper.vm, 'toggleTwoFactorAuthModal');

        wrapper.vm.handleFormSubmit();

        expect(wrapper.vm.toggleTwoFactorAuthModal).toHaveBeenCalledTimes(0);
      });

      it('should call toggleTwoFactorAuthModal', () => {
        wrapper = wrapFactory({
          computed: {
            isButtonDisabled: false,
          },
        });

        spyOn(wrapper.vm, 'toggleTwoFactorAuthModal');
        wrapper.vm.handleFormSubmit();

        expect(wrapper.vm.toggleTwoFactorAuthModal).toHaveBeenCalledTimes(1);
      });
    });

    describe('handleConfirmTwoFactorAuthModal', () => {
      const code = '123456';

      it('should call deleteOtpSettings', () => {
        wrapper.vm.handleConfirmTwoFactorAuthModal(code);

        expect(userActions.deleteOtpSettings).toHaveBeenCalledTimes(1);
        expect(userActions.deleteOtpSettings).toHaveBeenCalledWith(
          expect.any(Object),
          { code },
          undefined,
        );
      });

      it('should notify about successful update', async () => {
        expect.assertions(1);

        jest.spyOn(wrapper.vm, '$notify');

        await wrapper.vm.handleConfirmTwoFactorAuthModal(code);

        expect(wrapper.vm.$notify).toHaveBeenCalledWith({
          title: 'Settings Saved',
          text: 'Your settings have been saved.',
          type: 'is-info',
        });
      });

      it('should catch error and show notification', async () => {
        expect.assertions(2);

        const error = new Error();
        userActions.deleteOtpSettings.mockRejectedValueOnce(error);
        await wrapper.vm.handleConfirmTwoFactorAuthModal(code);

        expect(errorsActions.emitError).toHaveBeenCalledTimes(1);
        expect(errorsActions.emitError).toHaveBeenCalledWith(
          expect.any(Object),
          error,
          undefined,
        );
      });

      it('should call setOtpSettings', () => {
        const secret = 'secret';

        wrapper = wrapFactory({
          computed: {
            otpSettings: { secret },
          },
        });

        wrapper.vm.handleConfirmTwoFactorAuthModal(code);

        expect(userActions.setOtpSettings).toHaveBeenCalledTimes(1);
        expect(userActions.setOtpSettings).toHaveBeenCalledWith(
          expect.any(Object),
          {
            code,
            secret,
          },
          undefined,
        );
      });
    });
  });
});
