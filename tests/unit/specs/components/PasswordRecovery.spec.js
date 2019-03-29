import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';
import VeeValidate from 'vee-validate';
import Notifications from 'vue-notification';
import UIComponents from '@endpass/ui';

import PasswordRecovery from '@/components/PasswordRecovery';
import { mnemonic } from 'fixtures/accounts';

describe('PasswordRecovery', () => {
  let accountsActions;
  let storeOptions;
  let wrapper;

  beforeEach(() => {
    accountsActions = {
      recoverWalletsPassword: jest.fn().mockResolvedValue(true),
    };
    storeOptions = {
      modules: {
        accounts: {
          namespaced: true,
          actions: accountsActions,
        },
      },
    };
    const localVue = createLocalVue();

    localVue.use(Vuex);
    localVue.use(Notifications);
    localVue.use(VeeValidate);
    localVue.use(UIComponents);

    const store = new Vuex.Store(storeOptions);

    wrapper = shallowMount(PasswordRecovery, {
      store,
      localVue,
      sync: false,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('PasswordRecovery');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    describe('seed phrase field', () => {
      it('should disable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: true,
        });

        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-input-stub[data-test=input-seed-phrase]').attributes()
            .disabled,
        ).toBeTruthy();
      });

      it('should enable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: false,
        });

        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-input-stub[data-test=input-seed-phrase]').attributes()
            .disabled,
        ).toBeUndefined();
      });
    });

    describe('password field', () => {
      it('should disable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: true,
        });

        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-password-stub[data-test=input-password]').attributes()
            .disabled,
        ).toBeTruthy();
      });

      it('should enable field', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: false,
        });

        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-password-stub[data-test=input-password]').attributes()
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

        await wrapper.vm.$nextTick();

        expect(wrapper.find('v-button-stub').attributes().loading).toBeTruthy();
      });

      it('should not show loader', async () => {
        expect.assertions(1);

        wrapper.setData({
          isLoading: false,
        });

        await wrapper.vm.$nextTick();

        expect(
          wrapper.find('v-button-stub').attributes().loading,
        ).toBeUndefined();
      });
    });

    describe('confirm modal', () => {
      it('should toggle confirm modal', async () => {
        wrapper.vm.toggleConfirmModal();
        await wrapper.vm.$nextTick();
        expect(wrapper.find('confirm-modal-stub').html()).toMatchSnapshot();

        wrapper.vm.toggleConfirmModal();
        await wrapper.vm.$nextTick();
        expect(wrapper.find('confirm-modal-stub').exists()).toBeFalsy();
      });
    });
  });

  describe('behavior', () => {
    const password = 'password';
    const seedPhrase = 'seed phrase';

    describe('form', () => {
      it('should open confirm window', async () => {
        expect.assertions(1);

        wrapper.setData({
          seedPhrase,
          password,
        });

        wrapper.find('v-form-stub').vm.$emit('submit');

        await wrapper.vm.$nextTick();

        expect(wrapper.find('confirm-modal-stub').exists()).toBeTruthy();
      });
    });

    describe('confirm modal', () => {
      beforeEach(async () => {
        jest.spyOn(wrapper.vm, '$notify');

        wrapper.setData({
          seedPhrase,
          password,
          isConfirmModal: true,
        });

        await wrapper.vm.$nextTick();
      });

      it('should recover wallets password', async () => {
        expect.assertions(7);

        wrapper.find('confirm-modal-stub').vm.$emit('confirm');

        expect(wrapper.vm.isLoading).toBe(true);

        await wrapper.vm.$nextTick();

        expect(accountsActions.recoverWalletsPassword).toHaveBeenCalledTimes(1);
        expect(accountsActions.recoverWalletsPassword).toHaveBeenCalledWith(
          expect.any(Object),
          { password, seedPhrase },
          undefined,
        );
        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(0);
        expect(wrapper.vm.isLoading).toBe(false);
        expect(wrapper.vm.seedPhrase).toBe(null);
        expect(wrapper.vm.password).toBe(null);
      });

      it('should handle exceptions', async () => {
        expect.assertions(8);

        accountsActions.recoverWalletsPassword.mockRejectedValueOnce();

        wrapper.find('confirm-modal-stub').vm.$emit('confirm');

        expect(wrapper.vm.isLoading).toBe(true);

        await wrapper.vm.$nextTick();

        expect(accountsActions.recoverWalletsPassword).toHaveBeenCalledTimes(1);
        expect(accountsActions.recoverWalletsPassword).toHaveBeenCalledWith(
          expect.any(Object),
          { password, seedPhrase },
          undefined,
        );
        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$notify).toHaveBeenCalledWith({
          title: 'Error recovering wallet password',
          text:
            'An error occurred while recovering wallet password. Please try again.',
          type: 'is-danger',
        });
        expect(wrapper.vm.isLoading).toBe(false);
        expect(wrapper.vm.seedPhrase).toBe(null);
        expect(wrapper.vm.password).toBe(null);
      });

      it('should close confirm modal', async () => {
        expect.assertions(1);

        wrapper.find('confirm-modal-stub').vm.$emit('close');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('confirm-modal-stub').exists()).toBeFalsy();
      });
    });
  });
});
