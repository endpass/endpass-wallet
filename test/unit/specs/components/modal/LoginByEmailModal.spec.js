import { shallow, mount, createLocalVue } from '@vue/test-utils';

import LoginByEmailModal from '@/components/modal/LoginByEmailModal';
import { generateStubs } from '@/utils/testUtils';

describe('LoginByEmailModal', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(LoginByEmailModal, {
      stubs: generateStubs(LoginByEmailModal),
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('login-by-email-modal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    describe('the send button', () => {
      it('should change "disable" attribute', () => {
        wrapper.setData({
          termsAccepted: true,
        });

        expect(wrapper.find('v-button').attributes().disabled).toBeFalsy();

        wrapper.setData({ termsAccepted: false });
        expect(wrapper.find('v-button').attributes().disabled).toBeTruthy();
      });
    });
  });

  describe('props', () => {
    describe('isLoading', () => {
      it('should correctly change button "loading" property', () => {
        wrapper.setProps({
          isLoading: false,
        });
        expect(wrapper.find('v-button').attributes().loading).toBeFalsy();

        wrapper.setProps({
          isLoading: true,
        });
        expect(wrapper.find('v-button').attributes().loading).toBeTruthy();
      });
    });
  });

  describe('methods', () => {
    describe('handleSubmit', () => {
      it('should trigger "confirm" event', () => {
        const email = 'email';

        wrapper.setData({ email });
        wrapper.vm.handleSubmit();

        expect(wrapper.emitted().confirm).toEqual([[email]]);
      });
    });

    describe('handleClose', () => {
      it('should trigger "close" event', () => {
        wrapper.vm.handleClose();

        expect(wrapper.emitted().close).toEqual([[]]);
      });
    });
  });
});
