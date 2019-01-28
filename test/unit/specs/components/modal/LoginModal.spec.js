import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import directives from '@/directives';

import LoginModal from '@/components/modal/LoginModal';
import LoginByEmailModal from '@/components/modal/LoginByEmailModal';
import ConfirmEmailModal from '@/components/modal/ConfirmEmailModal';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Notifications);
localVue.use(directives);

jest.mock('@/components/modal/LoginByEmailModal', () => ({
  name: 'login-by-email-modal',
}));

jest.mock('@/components/modal/ConfirmEmailModal', () => ({
  name: 'confirm-email-modal',
}));

jest.mock('@/components/modal/TwoFactorAuthModal', () => ({
  name: 'two-factor-auth-modal',
}));

describe('LoginModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(LoginModal, {
      localVue,
      sync: false,
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

    it('should render LoginByEmailModal component', async () => {
      expect.assertions(1);

      wrapper.setData({
        currentModal: LoginByEmailModal.name,
      });

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      expect(wrapper.is(`${LoginByEmailModal.name}-stub`)).toBeTruthy();
    });

    it('should render ConfirmEmailModal component', async () => {
      expect.assertions(1);

      wrapper.setData({
        currentModal: ConfirmEmailModal.name,
      });

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      expect(wrapper.is(`${ConfirmEmailModal.name}-stub`)).toBeTruthy();
    });

    it('should render TwoFactorAuthModal component', async () => {
      expect.assertions(1);

      wrapper.setData({
        currentModal: TwoFactorAuthModal.name,
      });

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      expect(wrapper.is(`${TwoFactorAuthModal.name}-stub`)).toBeTruthy();
    });
  });

  describe('data', () => {
    describe('isLoading', () => {
      it('should correctly change "loading" property', async () => {
        wrapper.setData({
          isLoading: false,
        });

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(wrapper.attributes()['is-loading']).toBeUndefined();

        wrapper.setData({
          isLoading: true,
        });

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

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
      const $router = {
        push: jest.fn(),
      };
      const $route = {
        query: {},
      };
      const $ga = { event: jest.fn() };

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
        actions: {
          init: jest.fn().mockResolvedValue(),
        },
      });

      wrapper = shallowMount(LoginModal, {
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

      it('should login user via emailLink challenge type', async () => {
        expect.assertions(3);

        actions.login.mockResolvedValueOnce('emailLink');

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

      it('should reload data after successfully login', async () => {
        expect.assertions(1);

        wrapper.setMethods({
          reloadData: jest.fn().mockResolvedValue(),
        });

        await wrapper.vm.handleTwoFactorAuthModalConfirm(code);

        expect(wrapper.vm.reloadData).toHaveBeenCalledTimes(1);
      });
    });
  });
});
