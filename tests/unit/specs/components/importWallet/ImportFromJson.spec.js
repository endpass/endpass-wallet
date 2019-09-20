import { shallowMount, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';

import setupI18n from '@/locales/i18nSetup';
import ImportFromJson from '@/components/importWallet/ImportFromJson';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('ImportFromJson', () => {
  let wrapper;

  beforeEach(() => {
    const $router = {
      push: jest.fn(),
    };

    wrapper = shallowMount(ImportFromJson, {
      localVue,
      i18n,
      mocks: { $router },
      sync: false,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('ImportFromJson');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    describe('file input', () => {
      it('should show default file name', () => {
        wrapper.setData({ file: null });

        expect(wrapper.find('.file-cta .file-label').text()).toBe(
          'V3 JSON keystore file',
        );
      });

      it('should show file name', async () => {
        expect.assertions(1);

        const file = { name: 'file name' };

        wrapper.setData({ file });

        await wrapper.vm.$nextTick();

        expect(wrapper.find('.file-cta .file-label').text()).toBe(file.name);
      });
    });
  });

  describe('behavior', () => {
    it('should toggle password modal window', async () => {
      expect.assertions(2);

      wrapper.find('v-form-stub').vm.$emit('submit');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('password-modal-stub').html()).toMatchSnapshot();

      wrapper.find('password-modal-stub').vm.$emit('close');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('password-modal-stub').exists()).toBeFalsy();
    });

    describe('create a wallet from a json', () => {
      beforeEach(async () => {
        wrapper.setData({
          isPasswordModal: true,
        });

        await wrapper.vm.$nextTick();
      });

      it('should close password modal', async () => {
        expect.assertions(1);

        wrapper.find('password-modal-stub').vm.$emit('confirm');

        await wrapper.vm.$nextTick();

        expect(wrapper.find('password-modal-stub').exists()).toBeFalsy();
      });

      it('should call addWalletWithV3', () => {
        const password = 'password';
        const fileData = 'fileData';
        const jsonKeystorePassword = 'jsonKeystorePassword';

        wrapper.setData({ fileData, jsonKeystorePassword });
        wrapper.setMethods({
          addWalletWithV3: jest.fn(),
        });

        wrapper.find('password-modal-stub').vm.$emit('confirm', { password });

        expect(wrapper.vm.addWalletWithV3).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.addWalletWithV3).toHaveBeenCalledWith({
          json: fileData,
          jsonPassword: jsonKeystorePassword,
          walletPassword: expect.objectContaining({ password }),
        });
      });

      it('should redirect to the site root', async () => {
        expect.assertions(2);

        wrapper.setMethods({
          addWalletWithV3: jest.fn().mockResolvedValue(),
        });

        wrapper.find('password-modal-stub').vm.$emit('confirm');

        await global.flushPromises();

        expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/');
      });

      it('should handle errors', async () => {
        expect.assertions(2);

        const spyErrorsAdd = jest.spyOn(wrapper.vm.errors, 'add');

        wrapper.setMethods({
          addWalletWithV3: jest.fn().mockRejectedValue(),
        });

        wrapper.find('password-modal-stub').vm.$emit('confirm');

        await global.flushPromises();

        expect(spyErrorsAdd).toHaveBeenCalledTimes(1);
        expect(spyErrorsAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            field: 'jsonKeystorePassword',
            msg: 'JSON password is invalid',
            id: 'wrongPass',
          }),
        );
      });
    });
  });
});
