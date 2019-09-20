import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import Notifications from 'vue-notification';
import UIComponents from '@endpass/ui';

import setupI18n from '@/locales/i18nSetup';
import ChangePasswordSettings from '@/components/ChangePasswordSettings';

describe('ChangePasswordSettings', () => {
  let accountsActions;
  let storeOptions;
  let wrapper;

  beforeEach(() => {
    accountsActions = {
      updateWalletsWithNewPassword: jest.fn().mockResolvedValue(true),
      updateWallets: jest.fn(),
    };
    storeOptions = {
      modules: {
        accounts: {
          namespaced: true,
          actions: accountsActions,
          getters: {
            decryptedWallets: jest.fn(() => [{}]),
            hdWallet: jest.fn(() => ({})),
            encryptedHdWallet: jest.fn(() => ({})),
            encryptedWallets: jest.fn(() => [{}]),
          },
        },
      },
    };
    const localVue = createLocalVue();
    const i18n = setupI18n(localVue);

    localVue.use(Vuex);
    localVue.use(Notifications);
    localVue.use(VeeValidate);
    localVue.use(UIComponents);

    const store = new Vuex.Store(storeOptions);

    wrapper = shallowMount(ChangePasswordSettings, {
      i18n,
      store,
      localVue,
      sync: false,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ChangePasswordSettings');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    describe('old password field', () => {
      it('should disable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: true,
        });

        // hack for vue test utils pass correct values in attrs
        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-password-stub[name=oldPassword]').attributes()
            .disabled,
        ).toBeTruthy();
      });

      it('should enable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: false,
        });

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-password-stub[name=oldPassword]').attributes()
            .disabled,
        ).toBeUndefined();
      });
    });

    describe('new password field', () => {
      it('should disable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: true,
        });

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-password-stub[name=newPassword]').attributes()
            .disabled,
        ).toBeTruthy();
      });

      it('should enable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: false,
        });

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-password-stub[name=newPassword]').attributes()
            .disabled,
        ).toBeUndefined();
      });
    });

    describe('button', () => {
      it('should show loader', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: true,
        });

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(wrapper.find('v-button-stub').attributes().loading).toBeTruthy();
      });

      it('should not show loader', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: false,
        });

        wrapper.vm.$forceUpdate();
        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-button-stub').attributes().loading,
        ).toBeUndefined();
      });
    });
  });

  describe('methods', () => {
    describe('handleFormSubmit', () => {
      beforeEach(() => {
        jest.spyOn(wrapper.vm, '$notify');
        wrapper.setData({
          oldPassword: '1234',
          newPassword: '1234',
        });
      });

      it('should update all account wallets with new password if it is valid', async () => {
        expect.assertions(5);

        wrapper.vm.handleFormSubmit();
        await global.flushPromises();

        expect(accountsActions.updateWalletsWithNewPassword).toBeCalled();
        expect(wrapper.vm.$notify).toBeCalledWith({
          title: 'Password changed successfully',
          type: 'is-success',
        });
        expect(wrapper.vm.oldPassword).toBe(null);
        expect(wrapper.vm.newPassword).toBe(null);
        expect(wrapper.vm.isLoading).toBe(false);
      });

      it('should handle error if old password is incorrect and notify user about it', async () => {
        expect.assertions(5);

        const error = new Error('authentication code mismatch');

        accountsActions.updateWalletsWithNewPassword.mockRejectedValueOnce(
          error,
        );

        wrapper.vm.handleFormSubmit();
        await global.flushPromises();

        expect(accountsActions.updateWalletsWithNewPassword).toBeCalled();
        expect(wrapper.vm.$notify).toBeCalledWith({
          title: 'You entered incorrect password, try using a different one.',
          type: 'is-danger',
        });
        expect(wrapper.vm.oldPassword).toBe('1234');
        expect(wrapper.vm.newPassword).toBe('1234');
        expect(wrapper.vm.isLoading).toBe(false);
      });

      it('should handle error in other cases and notify user about it', async () => {
        expect.assertions(5);

        const error = new Error('foo');

        accountsActions.updateWalletsWithNewPassword.mockRejectedValueOnce(
          error,
        );

        wrapper.vm.handleFormSubmit();
        await global.flushPromises();

        expect(accountsActions.updateWalletsWithNewPassword).toBeCalled();
        expect(wrapper.vm.$notify).toBeCalledWith({
          title: 'Password was not changed.',
          type: 'is-danger',
        });
        expect(wrapper.vm.oldPassword).toBe('1234');
        expect(wrapper.vm.newPassword).toBe('1234');
        expect(wrapper.vm.isLoading).toBe(false);
      });

      it('should show error if changing was failed without errors', async () => {
        expect.assertions(5);

        accountsActions.updateWalletsWithNewPassword.mockResolvedValueOnce(
          false,
        );

        wrapper.vm.handleFormSubmit();
        await global.flushPromises();

        expect(accountsActions.updateWalletsWithNewPassword).toBeCalled();
        expect(wrapper.vm.$notify).toBeCalledWith({
          title: 'Password was not changed.',
          type: 'is-danger',
        });
        expect(wrapper.vm.oldPassword).toBe('1234');
        expect(wrapper.vm.newPassword).toBe('1234');
        expect(wrapper.vm.isLoading).toBe(false);
      });
    });
  });
});
