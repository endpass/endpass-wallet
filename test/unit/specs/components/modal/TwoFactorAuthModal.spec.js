import { shallow } from '@vue/test-utils';
import TwoFactorAuthModal from '@/components/modal/TwoFactorAuthModal';
import { generateStubs } from '@/utils/testUtils';

describe('TwoFactorAuthModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(TwoFactorAuthModal, {
      stubs: generateStubs(TwoFactorAuthModal),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('two-factor-auth-modal');
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
