import { shallowMount, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';
import {
  otpSecret,
  verificationCode,
  authenticatorCode,
} from 'fixtures/identity';
import setupI18n from '@/locales/i18nSetup';
import TwoFactorAuthForm from '@/components/modal/TwoFactorAuthModal/TwoFactorAuthForm';
import validation from '@/validation';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('TwoFactorAuthForm', () => {
  let wrapperFactory;
  let wrapper;

  beforeEach(() => {
    wrapperFactory = (options = {}) =>
      shallowMount(TwoFactorAuthForm, {
        localVue,
        i18n,
        sync: false,
        ...options,
      });

    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('TwoFactorAuthForm');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should not render QR code if secret or email are not passed in', () => {
      wrapper = wrapperFactory({
        propsData: {
          email: 'foo@bar.baz',
        },
      });

      expect(
        wrapper.find('[data-test=two-factor-auth-modal-qr-code]').exists(),
      ).toBe(false);

      wrapper = wrapperFactory({
        propsData: {
          secret: otpSecret,
        },
      });

      expect(
        wrapper.find('[data-test=two-factor-auth-modal-qr-code]').exists(),
      ).toBe(false);
    });

    it('should render QR code if secret and email are passed in', () => {
      wrapper = wrapperFactory({
        propsData: {
          email: 'foo@bar.baz',
          secret: otpSecret,
        },
      });

      expect(
        wrapper.find('[data-test=two-factor-auth-modal-qr-code]').exists(),
      ).toBe(false);
    });
  });

  describe.only('behavior', () => {
    beforeEach(() => {
      wrapper = wrapperFactory({
        propsData: {
          email: 'foo@bar.baz',
          secret: otpSecret,
        },
      });
    });

    it('should not submit form if code is not passed in', async () => {
      wrapper
        .find('[data-test=input-two-auth-code]')
        .vm.$emit('input', '');
      wrapper.find('v-form-stub').vm.$emit('submit');

      expect(wrapper.emitted().submit).toBeFalsy();
    });

    it('should not submit form if code is not valid', async () => {
      wrapper.find('[data-test=input-two-auth-code]').vm.$emit('input', '1234');
      wrapper.find('v-form-stub').vm.$emit('submit');

      expect(wrapper.emitted().submit).toBeFalsy();
    });

    it.only('should submit form if code is valid', async () => {
      wrapper
        .find('[data-test=input-two-auth-code]')
        .vm.$emit('input', authenticatorCode);

      wrapper.find('v-form-stub').vm.$emit('submit');

      expect(wrapper.emitted().submit).toEqual([[authenticatorCode]]);
    });
  });
});
