import { shallow, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import Notifications from 'vue-notification';

import ChangePasswordSettings from '@/components/ChangePasswordSettings';
import { generateStubs } from '@/utils/testUtils';

describe('ChangePasswordSettings', () => {
  const storeOptions = {
    modules: {
      accounts: {
        namespaced: true,
        actions: {
          saveWallet: jest.fn(),
        },
        getters: {
          decryptedWallets: jest.fn(() => [{}]),
          hdWallet: jest.fn(() => ({})),
          encryptedHdWallet: jest.fn(() => ({})),
          encryptedWallets: jest.fn(() => [{}]),
        },
      },
    },
  };
  let wrapper;

  beforeEach(() => {
    const localVue = createLocalVue();

    localVue.use(Vuex);
    localVue.use(Notifications);

    const store = new Vuex.Store(storeOptions);

    wrapper = shallow(ChangePasswordSettings, {
      store,
      localVue,
      stubs: generateStubs(ChangePasswordSettings),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('change-password-settings');
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
        spyOn(wrapper.vm, '$notify');
      });

      it('should handle the error of wallets decryption', () => {
        const { vm } = wrapper;

        wrapper.setComputed({
          decryptedWallets: jest.fn(() => {
            throw new Error();
          }),
        });
        wrapper.setMethods({
          saveWallet: jest.fn(),
        });

        vm.handleFormSubmit();

        expect(vm.$notify).toHaveBeenCalledTimes(1);
        expect(vm.$notify).toHaveBeenCalledWith({
          title: 'Error while decrypting wallets',
          text:
            'An error occurred while decrypting wallets. Try using a different password.',
          type: 'is-danger',
        });
        expect(vm.saveWallet).toHaveBeenCalledTimes(0);
      });

      it('should handle the error of HD wallet decryption', () => {
        const { vm } = wrapper;

        wrapper.setComputed({
          hdWallet: jest.fn(() => {
            throw new Error();
          }),
        });
        wrapper.setMethods({
          saveWallet: jest.fn(),
        });

        vm.handleFormSubmit();

        expect(vm.$notify).toHaveBeenCalledTimes(1);
        expect(vm.$notify).toHaveBeenCalledWith({
          title: 'Error while decrypting wallets',
          text:
            'An error occurred while decrypting wallets. Try using a different password.',
          type: 'is-danger',
        });
        expect(vm.saveWallet).toHaveBeenCalledTimes(0);
      });

      it('should handle the error of wallets encryption', () => {
        const { vm } = wrapper;

        wrapper.setComputed({
          encryptedHdWallet: jest.fn(() => {
            throw new Error();
          }),
        });
        wrapper.setMethods({
          saveWallet: jest.fn(),
        });

        vm.handleFormSubmit();

        expect(vm.$notify).toHaveBeenCalledTimes(1);
        expect(vm.$notify).toHaveBeenCalledWith({
          title: 'Error while decrypting wallets',
          text:
            'An error occurred while decrypting wallets. Try using a different password.',
          type: 'is-danger',
        });
        expect(vm.saveWallet).toHaveBeenCalledTimes(0);
      });

      it('should handle the error of HD wallet encryption', () => {
        const { vm } = wrapper;

        wrapper.setComputed({
          hdWallet: jest.fn(() => {
            throw new Error();
          }),
        });
        wrapper.setMethods({
          saveWallet: jest.fn(),
        });

        vm.handleFormSubmit();

        expect(vm.$notify).toHaveBeenCalledTimes(1);
        expect(vm.$notify).toHaveBeenCalledWith({
          title: 'Error while decrypting wallets',
          text:
            'An error occurred while decrypting wallets. Try using a different password.',
          type: 'is-danger',
        });
        expect(vm.saveWallet).toHaveBeenCalledTimes(0);
      });

      it('should handle the error while saving the wallets', async () => {
        const { vm } = wrapper;

        wrapper.setComputed({
          decryptedWallets: jest.fn(() => [{}]),
          hdWallet: jest.fn(() => ({})),
          encryptedHdWallet: jest.fn(() => ({})),
          encryptedWallets: jest.fn(() => [{}]),
        });
        wrapper.setMethods({
          saveWallet: jest.fn().mockRejectedValue(),
        });

        expect.assertions(5);

        await vm.handleFormSubmit();

        expect(vm.$notify).toHaveBeenCalledTimes(1);
        expect(vm.$notify).toHaveBeenCalledWith({
          title: 'Error while saving wallets',
          text: 'An error occurred while saving wallets. Please try again.',
          type: 'is-danger',
        });
        expect(vm.isLoading).toBeFalsy();
        expect(vm.oldPassword).toBeNull();
        expect(vm.newPassword).toBeNull();
      });

      it('should correctly decrypt wallets', () => {
        const { vm } = wrapper;
        const oldPassword = 'oldPassword';
        const wallet = {};
        const hdWallet = {};

        wrapper.setComputed({
          decryptedWallets: jest.fn(() => [wallet]),
          hdWallet: jest.fn(() => hdWallet),
        });
        wrapper.setData({ oldPassword });

        vm.handleFormSubmit();

        expect(vm.decryptedWallets).toHaveBeenCalledTimes(1);
        expect(vm.decryptedWallets).toHaveBeenCalledWith(vm.oldPassword);

        expect(vm.decryptedWallets).toHaveBeenCalledTimes(1);
        expect(vm.hdWallet).toHaveBeenCalledWith(vm.oldPassword);
      });

      it('should save wallets', async () => {
        const { vm } = wrapper;
        const newPassword = 'newPassword';

        wrapper.setComputed({
          decryptedWallets: jest.fn(() => [{}]),
          hdWallet: jest.fn(() => ({})),
          encryptedHdWallet: jest.fn((password, wallet) => ({
            ...wallet,
            password,
          })),
          encryptedWallets: jest.fn((password, wallets) =>
            wallets.map(wallet => ({
              ...wallet,
              password,
            })),
          ),
        });
        wrapper.setMethods({
          saveWallet: jest.fn().mockResolvedValue(),
        });
        wrapper.setData({ newPassword });

        expect.assertions(6);

        await vm.handleFormSubmit();

        expect(vm.saveWallet.mock.calls).toEqual([
          [
            {
              json: { password: newPassword },
            },
          ],
          [
            {
              json: { password: newPassword },
            },
          ],
        ]);
        expect(vm.$notify).toHaveBeenCalledTimes(1);
        expect(vm.$notify).toHaveBeenCalledWith({
          title: 'Password changed successfully',
          type: 'is-success',
        });
        expect(vm.isLoading).toBeFalsy();
        expect(vm.oldPassword).toBeNull();
        expect(vm.newPassword).toBeNull();
      });
    });
  });
});
