import { mount, createLocalVue } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';

const localVue = createLocalVue();

localVue.use(VeeValidate);

describe('TwoFactorAuthModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(TwoFactorAuthModal, {
      localVue,
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
