import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';

import TwoFactorAuthSettings from '@/components/TwoFactorAuthSettings';
import { generateStubs } from '@/utils/testUtils';

describe('TwoFactorAuthSettings', () => {
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

  beforeEach(() => {
    const localVue = createLocalVue();

    localVue.use(Vuex);
    localVue.use(Notifications);

    const store = new Vuex.Store(storeOptions);

    wrapper = shallow(TwoFactorAuthSettings, {
      store,
      localVue,
      stubs: generateStubs(TwoFactorAuthSettings),
    });
  });

  describe('render', () => {
    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should correctly render button text', () => {
      wrapper.setComputed({
        otpSettings: {
          secret: 'secret',
        },
      });
      expect(wrapper.find('v-button').text()).toBe('Enable Two Factor Auth');

      wrapper.setComputed({
        otpSettings: {
          secret: null,
        },
      });
      expect(wrapper.find('v-button').text()).toBe('Disable Two Factor Auth');
    });

    it('should correctly change button "disabled" property', () => {
      wrapper.setComputed({
        otpSettings: {
          secret: null,
          status: null,
        },
      });
      expect(wrapper.find('v-button').attributes().disabled).toBeTruthy();

      wrapper.setComputed({
        otpSettings: {
          secret: 'secret',
          status: null,
        },
      });
      expect(wrapper.find('v-button').attributes().disabled).toBeFalsy();

      wrapper.setComputed({
        otpSettings: {
          secret: null,
          status: 'status',
        },
      });
      expect(wrapper.find('v-button').attributes().disabled).toBeFalsy();

      wrapper.setComputed({
        otpSettings: {
          secret: 'secret',
          status: 'status',
        },
      });
      expect(wrapper.find('v-button').attributes().disabled).toBeFalsy();
    });

    it('should correctly change button "loading" property', () => {
      wrapper.setData({
        isLoading: false,
      });
      expect(wrapper.find('v-button').attributes().loading).toBeFalsy();

      wrapper.setData({
        isLoading: true,
      });
      expect(wrapper.find('v-button').attributes().loading).toBeTruthy();
    });

    it('should show modal window for two factor auth', async () => {
      wrapper.setData({
        isTwoFactorAuthModal: true,
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('handleFormSubmit', () => {
      it('should call toggleTwoFactorAuthModal', () => {
        spyOn(wrapper.vm, 'toggleTwoFactorAuthModal');

        wrapper.setComputed({
          isButtonDisabled: true,
        });
        wrapper.vm.handleFormSubmit();

        expect(wrapper.vm.toggleTwoFactorAuthModal).toHaveBeenCalledTimes(0);

        wrapper.setComputed({
          isButtonDisabled: false,
        });
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

        wrapper.setComputed({
          otpSettings: { secret },
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
