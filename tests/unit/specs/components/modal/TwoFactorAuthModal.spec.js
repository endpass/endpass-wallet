import { mount, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import UIComponents from '@endpass/ui';

import setupI18n from '@/locales/i18nSetup';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';
import validation from '@/validation';

const localVue = createLocalVue();
const i18n = setupI18n(localVue);

localVue.use(validation);
localVue.use(VeeValidate);
localVue.use(UIComponents);

describe('TwoFactorAuthModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(TwoFactorAuthModal, {
      localVue,
      i18n,
      sync: false,
      provide: {
        theme() {
          return 'default';
        },
      },
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('TwoFactorAuthModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render without secret and QR code', () => {
      expect(wrapper.element).toMatchSnapshot();

      wrapper.setProps({
        email: null,
        secret: 'secret',
      });

      expect(wrapper.element).toMatchSnapshot();

      wrapper.setProps({
        email: 'email',
        secret: null,
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should render with secret and QR code', () => {
      wrapper.setProps({
        email: 'email',
        secret: 'secret',
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });
});
