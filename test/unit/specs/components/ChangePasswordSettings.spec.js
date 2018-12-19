import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import Notifications from 'vue-notification';

import ChangePasswordSettings from '@/components/ChangePasswordSettings';
import { generateStubs } from '@/utils/testUtils';

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

    localVue.use(Vuex);
    localVue.use(Notifications);
    localVue.use(VeeValidate);

    const store = new Vuex.Store(storeOptions);

    wrapper = shallow(ChangePasswordSettings, {
      store,
      localVue,
      stubs: generateStubs(ChangePasswordSettings),
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
      it('should disable field', () => {
        wrapper.setData({
          isLoading: true,
        });

        expect(
          wrapper.find('v-password[name=oldPassword]').attributes().disabled,
        ).toBeTruthy();
      });

      it('should enable field', () => {
        wrapper.setData({
          isLoading: false,
        });

        expect(
          wrapper.find('v-password[name=oldPassword]').attributes().disabled,
        ).toBeUndefined();
      });
    });

    describe('new password field', () => {
      it('should disable field', () => {
        wrapper.setData({
          isLoading: true,
        });

        expect(
          wrapper.find('v-password[name=newPassword]').attributes().disabled,
        ).toBeTruthy();
      });

      it('should enable field', () => {
        wrapper.setData({
          isLoading: false,
        });

        expect(
          wrapper.find('v-password[name=newPassword]').attributes().disabled,
        ).toBeUndefined();
      });
    });

    describe('button', () => {
      it('should show loader', () => {
        wrapper.setData({
          isLoading: true,
        });

        expect(wrapper.find('v-button').attributes().loading).toBeTruthy();
      });

      it('should not show loader', () => {
        wrapper.setData({
          isLoading: false,
        });

        expect(wrapper.find('v-button').attributes().loading).toBeUndefined();
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
