import { shallowMount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';
import {
  otpSecret,
  verificationCode,
  authenticatorCode,
} from 'fixtures/identity';
import setupI18n from '@/locales/i18nSetup';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';
import validation from '@/validation';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(UIComponents);
localVue.use(validation);

describe('TwoFactorAuthModal', () => {
  let wrapperFactory;
  let wrapper;

  beforeEach(() => {
    wrapperFactory = (options = {}) =>
      shallowMount(TwoFactorAuthModal, {
        localVue,
        i18n,
        sync: false,
        ...options,
      });

    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('TwoFactorAuthModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
      wrapper = wrapperFactory({
        propsData: {
          secret: otpSecret,
        },
      });
    });

    it('should confirm otp settings with codes', async () => {
      expect.assertions(1);

      wrapper
        .find('two-factor-auth-form-stub')
        .vm.$emit('submit', {
          code: authenticatorCode,
          verificationCode,
        });

      expect(wrapper.emitted().confirm).toEqual([
        [
          {
            code: authenticatorCode,
            verificationCode,
          },
        ],
      ]);
    });
  });
});
