import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import { mount, shallow, createLocalVue } from '@vue/test-utils';

import { IDENTITY_MODE } from '@/constants';
import LoginByEmailModal from '@/components/modal/LoginByEmailModal';
import { generateStubs } from '@/utils/testUtils';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(VeeValidate);

describe('LoginByEmailModal', () => {
  let wrapper;

  beforeEach(() => {
    const $ga = { event: jest.fn() };
    const store = new Vuex.Store({
      modules: {
        user: {
          namespaced: true,
          actions: {
            validateCustomServer: jest.fn().mockResolvedValue(true),
          },
        },
      },
    });

    wrapper = shallow(LoginByEmailModal, {
      store,
      localVue,
      stubs: generateStubs(LoginByEmailModal),
      mocks: {
        $ga,
      },
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('LoginByEmailModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should display a field for custom identity server', () => {
      wrapper.setData({
        currentIdentityServerType: IDENTITY_MODE.CUSTOM,
      });

      expect(wrapper.find('#customIdentityServer').html()).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    describe('allow input', () => {
      it('should allow input by default', () => {
        expect(wrapper.vm.isInputAllowed).toBe(true);
      });

      it('should not allow input when loading', () => {
        wrapper.setProps({ isLoading: true });

        expect(wrapper.vm.isInputAllowed).toBe(false);
      });

      it('should not allow input when validating', () => {
        wrapper.setData({ isValidating: true });

        expect(wrapper.vm.isInputAllowed).toBe(false);
      });
    });

    describe('handle submit modal', () => {
      const email = 'email';
      const customIdentityServer = 'http://custom.com/api///';
      const validCustomIdentityServer = customIdentityServer.replace(
        /\/+$/,
        '',
      );

      it('should trigger "confirm" event', async () => {
        expect.assertions(1);

        const currentIdentityServerType = IDENTITY_MODE.DEFAULT;
        const expected = [
          {
            email,
            mode: {
              type: currentIdentityServerType,
              serverUrl: undefined,
            },
          },
        ];

        wrapper.setData({ email, currentIdentityServerType });

        await wrapper.vm.handleSubmit();

        expect(wrapper.emitted().confirm).toEqual([expected]);
      });

      it('should trigger "confirm" event with custom identity server url', async () => {
        expect.assertions(1);

        const currentIdentityServerType = IDENTITY_MODE.CUSTOM;
        const expected = [
          {
            email,
            mode: {
              type: currentIdentityServerType,
              serverUrl: validCustomIdentityServer,
            },
          },
        ];

        wrapper.setData({
          email,
          currentIdentityServerType,
          customIdentityServer,
        });

        await wrapper.vm.handleSubmit();

        expect(wrapper.emitted().confirm).toEqual([expected]);
      });

      it('should validate the custom server if the identity mode is custom', async () => {
        expect.assertions(2);

        wrapper.vm.validateServer = jest.fn();

        wrapper.setData({
          currentIdentityServerType: IDENTITY_MODE.CUSTOM,
          customIdentityServer,
        });

        await wrapper.vm.handleSubmit();

        expect(wrapper.vm.validateServer).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.validateServer).toBeCalledWith(
          validCustomIdentityServer,
        );
      });

      it('should not validate the custom server if the identity mode is not custom', async () => {
        expect.assertions(1);

        wrapper.setData({
          currentIdentityServerType: IDENTITY_MODE.DEFAULT,
        });
        wrapper.vm.validateServer = jest.fn();

        await wrapper.vm.handleSubmit();

        expect(wrapper.vm.validateServer).not.toBeCalled();
      });

      it('should emit error if the custom identity server if invalid', async () => {
        expect.assertions(2);

        const error = new Error();

        wrapper.setData({
          currentIdentityServerType: IDENTITY_MODE.CUSTOM,
          customIdentityServer,
        });
        wrapper.vm.validateServer = jest.fn().mockRejectedValueOnce(error);
        wrapper.vm.emitError = jest.fn();

        await wrapper.vm.handleSubmit();

        expect(wrapper.vm.emitError).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.emitError).toBeCalledWith(error);
      });
    });

    describe('handle close modal', () => {
      it('should trigger "close" event', () => {
        wrapper.vm.handleClose();

        expect(wrapper.emitted().close).toEqual([[]]);
      });
    });

    describe('custom server validation', () => {
      const serverUrl = 'server';

      it('should validate the custom server', async () => {
        expect.assertions(2);

        wrapper.vm.validateCustomServer = jest.fn();

        await wrapper.vm.validateServer(serverUrl);

        expect(wrapper.vm.validateCustomServer).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.validateCustomServer).toBeCalledWith({ serverUrl });
      });

      it('should activate the loader while validating a custom server', async () => {
        expect.assertions(2);

        jest.useFakeTimers();

        wrapper.vm.validateCustomServer = jest.fn(
          () =>
            new Promise(res => {
              setTimeout(() => {
                res();
              }, 1000);
            }),
        );

        wrapper.vm.validateServer();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.isValidating).toBe(true);

        jest.runAllTimers();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.isValidating).toBe(false);
      });
    });

    describe('validation', () => {
      beforeEach(() => {
        wrapper = mount(LoginByEmailModal, {
          localVue,
        });
      });

      it('should disable submit button by default', () => {
        const button = wrapper.find('[data-test=submit-login]');
        expect(button.attributes().disabled).toBeTruthy();
      });
    });
  });
});
