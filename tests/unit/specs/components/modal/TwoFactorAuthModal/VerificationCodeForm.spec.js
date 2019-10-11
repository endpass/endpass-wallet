import { shallowMount, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import UIComponents from '@endpass/ui';
import setupI18n from '@/locales/i18nSetup';
import VerificationCodeForm from '@/components/modal/TwoFactorAuthModal/VerificationCodeForm';
import validation from '@/validation';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents)

describe('VerificationCodeForm', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(VerificationCodeForm, {
      localVue,
      i18n,
      sync: false,
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('VerificationCodeForm');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });
});
