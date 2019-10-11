import { shallowMount, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';
import { otpSecret, verificationCode, authenticatorCode } from 'fixtures/identity'
import setupI18n from '@/locales/i18nSetup';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';
import validation from '@/validation';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(UIComponents)
localVue.use(validation);
localVue.use(VeeValidate);

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

    it('should render without secret and QR code', () => {
      wrapper = wrapperFactory({
        propsData: {
          email: null,
          secret: 'secret',
        },
      });

      expect(wrapper.element).toMatchSnapshot();

      wrapper = wrapperFactory({
        propsData: {
          email: 'email',
          secret: null,
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render with secret and QR code', () => {
      wrapper = wrapperFactory({
        propsData: {
          email: 'email',
          secret: 'secret',
        },
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    beforeEach(() => {
wrapper = wrapperFactory({
        propsData: {
          secret: otpSecret
        }
      })
    })

    it('should handle verification code request', () => {

      wrapper.find('verification-code-form-stub').vm.$emit('request-code')

      expect(wrapper.emitted()['request-code']).toEqual([[]])
    })

    it('should confirm otp settings with verification code and otp code', async () => {
      expect.assertions(3)

      wrapper.find('verification-code-form-stub').vm.$emit('submit', verificationCode)

      await wrapper.vm.$nextTick()

      expect(wrapper.find('verification-code-form-stub').exists()).toBe(false)
      expect(wrapper.find('two-factor-auth-form-stub').exists()).toBe(true)

      wrapper.find('two-factor-auth-form-stub').vm.$emit('submit', authenticatorCode)

      expect(wrapper.emitted().confirm).toEqual([[{
        code: authenticatorCode,
        verificationCode
      }]])
    })
  })
});
