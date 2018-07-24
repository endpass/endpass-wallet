import { shallow, createLocalVue, mount } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import VeeValidate from 'vee-validate';

import LoginPage from '@/components/pages/Login.vue';
import { generateStubs } from '@/utils/testUtils';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Notifications);
localVue.use(VeeValidate);

describe('LoginPage', () => {
  let wrapper;
  let actions;
  let store;
  let options;

  describe('render', () => {
    let wrapper;

    beforeAll(() => {
      wrapper = shallow(LoginPage, {
        stubs: generateStubs(LoginPage),
      });
    });

    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('login-page');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should show modal window for two factor auth', () => {
      wrapper.setData({
        isTwoFactorAuthModal: true,
      });

      expect(wrapper.find('two-factor-auth-modal').exists()).toBeTruthy();

      wrapper.setData({
        isTwoFactorAuthModal: false,
      });

      expect(wrapper.find('two-factor-auth-modal').exists()).toBeFalsy();
    });

    it('should show message for successfull login', () => {
      wrapper.setData({
        isSuccess: false,
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    describe('the send button', () => {
      it('should change "disable" attribute', () => {
        wrapper.setData({ termsAccepted: true });
        expect(wrapper.find('v-button').attributes().disabled).toBeFalsy();

        wrapper.setData({ termsAccepted: false });
        expect(wrapper.find('v-button').attributes().disabled).toBeTruthy();
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

      localVue.use(Vuex);
      localVue.use(Notifications);

      const store = new Vuex.Store({
        modules: {
          accounts: {
            namespaced: true,
            actions,
          },
        },
      });

      wrapper = shallow(LoginPage, { store, localVue });
    });

    afterEach(() => {
      actions.login.mockClear();
      actions.loginViaOTP.mockClear();
    });

    describe('handleLogin', () => {
      beforeEach(() => {
        spyOn(wrapper.vm, '$notify');
      });

      it('should login user via emeil_link challenge type', async () => {
        await wrapper.vm.handleLogin();

        expect(wrapper.vm.isSending).toBeFalsy();
        expect(wrapper.vm.isSuccess).toBeTruthy();
        expect(wrapper.vm.isTwoFactorAuthModal).toBeFalsy();
        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$notify).toHaveBeenCalledWith({
          title: 'Success',
          text: 'Click the link in your email to log in',
          type: 'is-info',
        });
      });

      it('should login user via OTP challenge type', async () => {
        actions.login.mockResolvedValueOnce('otp');

        await wrapper.vm.handleLogin();

        expect(wrapper.vm.isSending).toBeFalsy();
        expect(wrapper.vm.isSuccess).toBeFalsy();
        expect(wrapper.vm.isTwoFactorAuthModal).toBeTruthy();
        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(0);
      });

      it('should not login user', async () => {
        const error = {};

        spyOn(wrapper.vm, 'emitError');
        actions.login.mockRejectedValueOnce(error);

        try {
          await wrapper.vm.handleLogin();
        } catch (e) {
          expect(wrapper.vm.isSending).toBeFalsy();
          expect(wrapper.vm.isSuccess).toBeFalsy();
          expect(wrapper.vm.isTwoFactorAuthModal).toBeFalsy();
          expect(wrapper.vm.$notify).toHaveBeenCalledTimes(0);
          expect(wrapper.vm.$notify).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.$notify).toHaveBeenCalledWith(error);
        }
      });
    });

    describe('handleConfirmTwoFactorAuthModal', () => {
      beforeEach(() => {
        spyOn(wrapper.vm, '$notify');

        wrapper.setData({
          isTwoFactorAuthModal: true,
        });
      });

      it('should login user via OTP challenge type', async () => {
        await wrapper.vm.handleConfirmTwoFactorAuthModal();

        expect(wrapper.vm.isSending).toBeFalsy();
        expect(wrapper.vm.isSuccess).toBeTruthy();
        expect(wrapper.vm.isTwoFactorAuthModal).toBeFalsy();
        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$notify).toHaveBeenCalledWith({
          title: 'Success',
          text: 'Click the link in your email to log in',
          type: 'is-info',
        });
      });

      it('should not login user', async () => {
        const error = {};

        spyOn(wrapper.vm, 'emitError');
        actions.loginViaOTP.mockRejectedValueOnce(error);

        try {
          await wrapper.vm.handleConfirmTwoFactorAuthModal();
        } catch (e) {
          expect(wrapper.vm.isSending).toBeFalsy();
          expect(wrapper.vm.isSuccess).toBeFalsy();
          expect(wrapper.vm.isTwoFactorAuthModal).toBeFalsy();
          expect(wrapper.vm.$notify).toHaveBeenCalledTimes(0);
          expect(wrapper.vm.$notify).toHaveBeenCalledTimes(1);
          expect(wrapper.vm.$notify).toHaveBeenCalledWith(error);
        }
      });
    });
  });

  beforeEach(() => {
    actions = {
      login: jest.fn(() => Promise.resolve()),
    };

    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          actions,
        },
      },
    });

    options = {
      store,
      localVue,
    };

    wrapper = shallow(LoginPage, options);
  });

  it('should call login action when click', async () => {
    wrapper = mount(LoginPage, options);

    const email = '123@123.com';

    wrapper.setData({ email });

    wrapper.find('a#send-button').trigger('click');

    await new Promise(res => setTimeout(res, 50));
    expect(actions.login).toHaveBeenCalledTimes(1);
    expect(actions.login).toBeCalledWith(expect.any(Object), email, undefined);

    await actions.login();
    await wrapper.vm.$nextTick();

    expect(wrapper.find('p#success-message')).toBeTruthy();
  });

  it('should validate data', async () => {
    wrapper = mount(LoginPage, {
      store,
      localVue,
    });

    const { errors } = wrapper.vm;

    wrapper.setData({
      email: '',
    });

    await wrapper.vm.$validator.validateAll();

    expect(errors.first('email').includes('required')).toBeTruthy();

    wrapper.setData({
      email: '123@123.com',
    });

    await wrapper.vm.$validator.validateAll();

    expect(errors.has('email')).toBeFalsy();

    wrapper.setData({
      email: '123',
    });

    await wrapper.vm.$validator.validateAll();

    expect(
      errors.first('email').includes('must be a valid email'),
    ).toBeTruthy();
  });
});
