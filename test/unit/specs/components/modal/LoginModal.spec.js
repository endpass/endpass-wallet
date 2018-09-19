import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';

import LoginModal from '@/components/modal/LoginModal';
import LoginByEmailModal from '@/components/modal/LoginByEmailModal';
import ConfirmEmailModal from '@/components/modal/ConfirmEmailModal';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';
import { generateStubs } from '@/utils/testUtils';

describe('LoginModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(LoginModal, {
      stubs: generateStubs(LoginModal),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('LoginModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render LoginByEmailModal component', () => {
      wrapper.setData({
        currentModal: LoginByEmailModal.name,
      });

      expect(wrapper.is(LoginByEmailModal.name)).toBeTruthy();
    });

    it('should render ConfirmEmailModal component', () => {
      wrapper.setData({
        currentModal: LoginByEmailModal.name,
      });

      expect(wrapper.is(LoginByEmailModal.name)).toBeTruthy();
    });

    it('should render TwoFactorAuthModal component', () => {
      wrapper.setData({
        currentModal: TwoFactorAuthModal.name,
      });

      expect(wrapper.is(TwoFactorAuthModal.name)).toBeTruthy();
    });
  });

  describe('data', () => {
    describe('isLoading', () => {
      it('should correctly change "loading" property', () => {
        wrapper.setData({
          isLoading: false,
        });
        expect(wrapper.attributes()['is-loading']).toBeUndefined();

        wrapper.setData({
          isLoading: true,
        });
        expect(wrapper.attributes()['is-loading']).toBeTruthy();
      });
    });
  });

  describe('methods', () => {
    const actions = {
      login: jest.fn(),
      loginViaOTP: jest.fn(),
    };
    let wrapper;

    beforeEach(() => {
      const localVue = createLocalVue();
      const $router = {
        push: jest.fn(),
      };
      const $route = {
        query: {},
      };
      const $ga = { event: jest.fn() };

      localVue.use(Vuex);
      localVue.use(Notifications);

      const store = new Vuex.Store({
        modules: {
          user: {
            namespaced: true,
            actions,
          },
          errors: {
            namespaced: true,
            actions: {
              emitError: jest.fn(),
            },
          },
        },
      });

      wrapper = shallow(LoginModal, {
        store,
        localVue,
        mocks: { $route, $router, $ga },
      });
    });

    afterEach(() => {
      actions.login.mockClear();
      actions.loginViaOTP.mockClear();
    });

    describe('handleLoginByEmailModalConfirm', () => {
      const email = 'email';

      beforeEach(() => {
        jest.spyOn(wrapper.vm, '$notify');
      });

      it('should login user via email_link challenge type', async () => {
        expect.assertions(3);

        actions.login.mockResolvedValueOnce('email_link');

        await wrapper.vm.handleLoginByEmailModalConfirm(email);

        expect(wrapper.vm.isLoading).toBeFalsy();
        expect(wrapper.vm.currentModal).toBe(ConfirmEmailModal.name);
        expect(wrapper.emitted().close).toBeUndefined();
      });

      it('should login user via OTP challenge type', async () => {
        expect.assertions(4);

        actions.login.mockResolvedValueOnce('otp');

        await wrapper.vm.handleLoginByEmailModalConfirm(email);

        expect(wrapper.vm.isLoading).toBeFalsy();
        expect(wrapper.vm.currentModal).toBe(TwoFactorAuthModal.name);
        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(0);
        expect(wrapper.emitted().close).toBeUndefined();
      });

      it('should not login user', async () => {
        expect.assertions(5);

        const error = {};

        jest.spyOn(wrapper.vm, 'emitError');
        actions.login.mockRejectedValueOnce(error);

        await wrapper.vm.handleLoginByEmailModalConfirm(email);

        expect(wrapper.vm.isLoading).toBeFalsy();
        expect(wrapper.vm.currentModal).toBe(LoginByEmailModal.name);
        expect(wrapper.vm.emitError).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.emitError).toHaveBeenCalledWith(error);
        expect(wrapper.emitted().close).toBeUndefined();
      });
    });

    describe('handleTwoFactorAuthModalConfirm', () => {
      const code = '111';

      beforeEach(() => {
        jest.spyOn(wrapper.vm, '$notify');

        wrapper.setData({
          currentModal: TwoFactorAuthModal.name,
        });
      });

      it('should login user via OTP challenge type', async () => {
        await wrapper.vm.handleTwoFactorAuthModalConfirm(code);

        expect(wrapper.vm.isLoading).toBeFalsy();
        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$notify).toHaveBeenCalledWith({
          title: 'Success',
          text: 'Logged In',
          type: 'is-info',
        });
        expect(wrapper.emitted().close).toEqual([[]]);
      });

      it('should not login user', async () => {
        const error = {};

        jest.spyOn(wrapper.vm, 'emitError');
        actions.loginViaOTP.mockRejectedValueOnce(error);

        await wrapper.vm.handleTwoFactorAuthModalConfirm(code);

        expect(wrapper.vm.isLoading).toBeFalsy();
        expect(wrapper.vm.emitError).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.emitError).toHaveBeenCalledWith(error);
        expect(wrapper.emitted().close).toBeUndefined();
      });

      it('should redirect after login', async () => {
        const regirectUri = '/some-page';

        wrapper.vm.$route.query.redirect_uri = regirectUri;

        await wrapper.vm.handleTwoFactorAuthModalConfirm(code);

        expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          path: regirectUri,
        });
      });

      it('should not redirect after login', async () => {
        await wrapper.vm.handleTwoFactorAuthModalConfirm(code);

        expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(0);
      });
    });
  });
});
