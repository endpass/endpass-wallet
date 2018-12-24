import { shallow, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import ImportFromJson from '@/components/importWallet/ImportFromJson';
import { testUtils } from '@endpass/utils';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('ImportFromJson', () => {
  let wrapper;

  beforeEach(() => {
    const $router = {
      push: jest.fn(),
    };

    wrapper = shallow(ImportFromJson, {
      localVue,
      stubs: testUtils.generateStubs(ImportFromJson),
      mocks: { $router },
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

      it('should show file name', () => {
        const file = { name: 'file name' };

        wrapper.setData({ file });

        expect(wrapper.find('.file-cta .file-label').text()).toBe(file.name);
      });
    });
  });

  describe('behavior', () => {
    it('should toggle password modal window', async () => {
      wrapper.find('v-form').trigger('submit');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('password-modal').html()).toMatchSnapshot();

      wrapper.find('password-modal').trigger('close');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('password-modal').exists()).toBeFalsy();
    });

    describe('create a wallet from a json', () => {
      beforeEach(async () => {
        wrapper.setData({
          isPasswordModal: true,
        });

        await wrapper.vm.$nextTick();
      });

      it('should close password modal', async () => {
        wrapper.find('password-modal').trigger('confirm');

        await wrapper.vm.$nextTick();

        expect(wrapper.find('password-modal').exists()).toBeFalsy();
      });

      it('should call addWalletWithV3', () => {
        const password = 'password';
        const fileData = 'fileData';
        const jsonKeystorePassword = 'jsonKeystorePassword';

        wrapper.setData({ fileData, jsonKeystorePassword });
        wrapper.setMethods({
          addWalletWithV3: jest.fn(),
        });

        wrapper.find('password-modal').trigger('confirm', { password });

        expect(wrapper.vm.addWalletWithV3).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.addWalletWithV3).toHaveBeenCalledWith({
          json: fileData,
          jsonPassword: jsonKeystorePassword,
          walletPassword: expect.objectContaining({ password }),
        });
      });

      it('should redirect to the site root', async () => {
        wrapper.setMethods({
          addWalletWithV3: jest.fn().mockResolvedValue(),
        });

        wrapper.find('password-modal').trigger('confirm');

        await flushPromises();

        expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/');
      });

      it('should handle errors', async () => {
        const spyErrorsAdd = spyOn(wrapper.vm.errors, 'add');

        wrapper.setMethods({
          addWalletWithV3: jest.fn().mockRejectedValue(),
        });

        wrapper.find('password-modal').trigger('confirm');

        await flushPromises();

        expect(spyErrorsAdd).toHaveBeenCalledTimes(1);
        expect(spyErrorsAdd).toHaveBeenCalledWith({
          field: 'jsonKeystorePassword',
          msg: 'JSON password is invalid',
          id: 'wrongPass',
        });
      });
    });
  });
});
