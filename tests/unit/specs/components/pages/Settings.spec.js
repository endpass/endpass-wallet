import Vuex from 'vuex';
import { createLocalVue, mount } from '@vue/test-utils';
import Notifications from 'vue-notification';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';
import validation from '@/validation';
import { wrapShallowMountFactory } from '@/testUtils';

import { IDENTITY_MODE } from '@/constants';
import SettingsPage from '@/components/pages/Settings.vue';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(Notifications);
localVue.use(UIComponents);

describe('SettingsPage', () => {
  const actions = {
    updateSettings: jest.fn(),
    getOtpSettings: jest.fn(),
    setOtpSettings: jest.fn(),
    deleteOtpSettings: jest.fn(),
  };
  const storeOptions = {
    modules: {
      user: {
        namespaced: true,
        state: {
          settings: {
            fiatCurrency: 'USD',
          },
          availableCurrencies: ['USD', 'AUD', 'BRL'],
          otpSettings: {
            secret: 'AABC',
          },
          identityType: IDENTITY_MODE.DEFAULT,
        },
        getters: {
          isDefaultIdentity: () => true,
        },
        actions,
      },
      accounts: {
        namespaced: true,
        getters: {
          hdWallet: jest.fn(),
          decryptedWallets: jest.fn(),
          encryptedWallets: jest.fn(),
          encryptedHdWallet: jest.fn(),
        },
      },
    },
  };
  let wrapper;
  let wrapperFactory;
  let store;
  let options;

  beforeEach(() => {
    store = new Vuex.Store(storeOptions);

    options = {
      store,
      localVue,
      sync: false,
    };
    wrapperFactory = wrapShallowMountFactory(SettingsPage, options);
    wrapper = wrapperFactory();
  });

  afterEach(() => {
    actions.updateSettings.mockClear();
  });

  describe('render', () => {
    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should not render email and otp settings when not default identity type', () => {
      wrapper = wrapperFactory({
        computed: {
          isDefaultIdentity: false,
        },
      });

      expect(wrapper.find('v-input-stub[type=email]').exists()).toBeFalsy();
      expect(
        wrapper.find('two-factor-auth-settings-stub').exists(),
      ).toBeFalsy();
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('props', () => {
    it('should set data from props correctly', () => {
      expect(wrapper.vm.$data.newSettings).toEqual(wrapper.vm.settings);
    });
  });

  describe('behavior', () => {
    it('should call update action with new settings', () => {
      const newSettings = {
        fiatCurrency: 'AUD',
      };

      // https://github.com/vuejs/vue-test-utils/issues/149
      // wrapper.setData({ newSettings });
      wrapper.vm.$data.newSettings = newSettings;
      wrapper.vm.updateSettings();

      expect(actions.updateSettings).toBeCalledTimes(1);
      expect(actions.updateSettings).toBeCalledWith(
        expect.any(Object),
        newSettings,
        undefined,
      );
      expect(actions.updateSettings.mock.calls[0][1]).not.toBe(newSettings);
    });

    it('should validate settings properly', async () => {
      expect.assertions(3);

      wrapper = mount(SettingsPage, {
        store,
        localVue,
        sync: false,
      });

      expect(wrapper.vm.errors.any()).toBeFalsy();

      wrapper.setData({
        newSettings: {
          fiatCurrency: 'AUD',
        },
      });

      await wrapper.vm.$validator.validateAll();

      expect(wrapper.vm.errors.any()).toBeFalsy();

      wrapper.setData({
        newSettings: {
          fiatCurrency: 'USD',
        },
      });

      await wrapper.vm.$validator.validateAll();

      expect(wrapper.vm.errors.any()).toBeFalsy();
    });

    it('should change lock status on seed recovery lock event', () => {
      expect.assertions(1);
      wrapper.find('seed-recovery-stub').vm.$emit('lock');
      expect(wrapper.vm.isSeedRecoveryLocked).toBe(true);
    });
  });
});
