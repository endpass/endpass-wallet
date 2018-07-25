import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import TwoFactorAuthSettings from '@/components/TwoFactorAuthSettings';
import { generateStubs } from '@/utils/testUtils';

describe('TwoFactorAuthSettings', () => {
  const actions = {
    getOtpSettings: jest.fn(),
    setOtpSettings: jest.fn(),
    deleteOtpSettings: jest.fn(),
  };
  const storeOptions = {
    modules: {
      accounts: {
        namespaced: true,
        state: {
          email: 'email',
          otpSettings: {
            secret: null,
            status: null,
          },
        },
        actions,
      },
    },
  };
  let wrapper;

  beforeEach(() => {
    const localVue = createLocalVue();

    localVue.use(Vuex);

    const store = new Vuex.Store(storeOptions);

    wrapper = shallow(TwoFactorAuthSettings, {
      store,
      localVue,
      stubs: generateStubs(TwoFactorAuthSettings),
    });
  });

  afterEach(() => {
    actions.getOtpSettings.mockClear();
    actions.setOtpSettings.mockClear();
    actions.deleteOtpSettings.mockClear();
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
    describe('handleButtonClick', () => {
      it('should call toggleTwoFactorAuthModal', () => {
        spyOn(wrapper.vm, 'toggleTwoFactorAuthModal');

        wrapper.setComputed({
          isButtonDisabled: true,
        });
        wrapper.vm.handleButtonClick();

        expect(wrapper.vm.toggleTwoFactorAuthModal).toHaveBeenCalledTimes(0);

        wrapper.setComputed({
          isButtonDisabled: false,
        });
        wrapper.vm.handleButtonClick();

        expect(wrapper.vm.toggleTwoFactorAuthModal).toHaveBeenCalledTimes(1);
      });
    });

    describe('handleConfirmTwoFactorAuthModal', () => {
      const code = '123456';

      it('should call deleteOtpSettings', () => {
        spyOn(wrapper.vm, 'deleteOtpSettings');

        wrapper.vm.handleConfirmTwoFactorAuthModal(code);

        expect(wrapper.vm.deleteOtpSettings).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.deleteOtpSettings).toHaveBeenCalledWith({ code });
      });

      it('should call setOtpSettings', () => {
        const secret = 'secret';

        spyOn(wrapper.vm, 'setOtpSettings');

        wrapper.setComputed({
          otpSettings: { secret },
        });
        wrapper.vm.handleConfirmTwoFactorAuthModal(code);

        expect(wrapper.vm.setOtpSettings).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.setOtpSettings).toHaveBeenCalledWith({
          code,
          secret,
        });
      });
    });
  });
});
