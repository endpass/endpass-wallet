import { shallowMount, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';
import { verificationCode } from 'fixtures/identity';
import setupI18n from '@/locales/i18nSetup';
import VerificationCodeForm from '@/components/modal/TwoFactorAuthModal/VerificationCodeForm';
import validation from '@/validation';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('VerificationCodeForm', () => {
  let wrapperFactory;
  let wrapper;

  beforeEach(() => {
    wrapperFactory = (options = {}) =>
      shallowMount(VerificationCodeForm, {
        localVue,
        i18n,
        sync: false,
        ...options,
      });

    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('VerificationCodeForm');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('behavior', () => {
    it('should not submit form if code is not passed in', async () => {
      expect.assertions(1);

      wrapper
        .find('[data-test=input-two-auth-verification-code]')
        .vm.$emit('input', '');

      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      wrapper.find('v-form-stub').trigger('submit');

      expect(wrapper.emitted().submit).toBeFalsy();
    });

    it('should not submit form if code is not valid', async () => {
      expect.assertions(1);

      wrapper
        .find('[data-test=input-two-auth-verification-code]')
        .vm.$emit('input', '1234');

      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      wrapper.find('v-form-stub').trigger('submit');

      expect(wrapper.emitted().submit).toBeFalsy();
    });

    it('should submit form if code is valid', async () => {
      expect.assertions(1);

      wrapper
        .find('[data-test=input-two-auth-verification-code]')
        .vm.$emit('input', verificationCode);

      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      wrapper.find('v-form-stub').trigger('submit');

      expect(wrapper.emitted().submit).toEqual([[verificationCode]]);
    });
  });
});
