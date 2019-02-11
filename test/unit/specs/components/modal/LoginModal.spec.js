import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';
import directives from '@/directives';

import LoginModal from '@/components/modal/LoginModal';
import LoginModalModes from '@/components/modal/LoginModalModes';

const localVue = createLocalVue();
localVue.use(Vuex);
localVue.use(Notifications);
localVue.use(directives);

jest.mock('@/components/modal/LoginModalModes', () => ({
  name: 'login-modal-modes',
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

    it('should render LoginModalModes component', async () => {
      expect.assertions(1);

      wrapper.setData({
        currentModal: LoginModalModes.name,
      });

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      expect(wrapper.is(`${LoginModalModes.name}-stub`)).toBeTruthy();
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

    describe('handleLoginByEmail', () => {
      const email = 'email';

      beforeEach(() => {
        jest.spyOn(wrapper.vm, '$notify');
      });

      it('should login user via emailLink challenge type', async () => {
        expect.assertions(3);

        actions.login.mockResolvedValueOnce('emailLink');

        await wrapper.vm.handleLoginByEmail(email);

        expect(wrapper.vm.isLoading).toBeFalsy();
        expect(wrapper.vm.currentModal).toBe(LoginModalModes.name);
        expect(wrapper.emitted().close).not.toBeUndefined();
      });

      it('should not login user', async () => {
        expect.assertions(5);

        const error = {};

        jest.spyOn(wrapper.vm, 'emitError');
        actions.login.mockRejectedValueOnce(error);

        await wrapper.vm.handleLoginByEmail(email);

        expect(wrapper.vm.isLoading).toBeFalsy();
        expect(wrapper.vm.currentModal).toBe(LoginModalModes.name);
        expect(wrapper.vm.emitError).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.emitError).toHaveBeenCalledWith(error);
        expect(wrapper.emitted().close).toBeUndefined();
      });
    });
  });
});
