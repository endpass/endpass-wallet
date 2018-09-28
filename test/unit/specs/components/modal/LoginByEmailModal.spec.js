import { shallow, mount } from '@vue/test-utils';

import LoginByEmailModal from '@/components/modal/LoginByEmailModal';
import { generateStubs } from '@/utils/testUtils';

describe('LoginByEmailModal', () => {
  let wrapper;

  beforeEach(() => {
    const $ga = { event: jest.fn() };
    wrapper = shallow(LoginByEmailModal, {
      stubs: generateStubs(LoginByEmailModal),
      mocks: {
        $ga,
      },
    });
  });

  describe('render', () => {
    it('should be a Vue component', () => {
      expect(wrapper.name()).toBe('LoginByEmailModal');
      expect(wrapper.isVueInstance()).toBeTruthy();
    });

    it('should render component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should display a field for custom identity server', () => {
      wrapper.setData({
        currentIdentityServerType: 'custom',
      });

      expect(wrapper.find('#customIdentityServer').html()).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('handleSubmit', () => {
      const email = 'email';

      it('should trigger "confirm" event', () => {
        const currentIdentityServerType = 'default';
        const expected = [
          {
            email,
            mode: {
              type: currentIdentityServerType,
              serverUrl: undefined,
            },
          },
        ];

        wrapper.setData({ email, currentIdentityServerType });
        wrapper.vm.handleSubmit();

        expect(wrapper.emitted().confirm).toEqual([expected]);
      });

      it('should trigger "confirm" event with custom identity server url', () => {
        const customIdentityServer = 'custom identity server url';
        const currentIdentityServerType = 'custom';
        const expected = [
          {
            email,
            mode: {
              type: currentIdentityServerType,
              serverUrl: customIdentityServer,
            },
          },
        ];

        wrapper.setData({
          email,
          currentIdentityServerType,
          customIdentityServer,
        });
        wrapper.vm.handleSubmit();

        expect(wrapper.emitted().confirm).toEqual([expected]);
      });
    });

    describe('handleClose', () => {
      it('should trigger "close" event', () => {
        wrapper.vm.handleClose();

        expect(wrapper.emitted().close).toEqual([[]]);
      });
    });
  });

  describe('behavior', () => {
    describe('validation', () => {
      beforeEach(() => {
        wrapper = mount(LoginByEmailModal, {
          stubs: generateStubs(LoginByEmailModal),
        });
      });

      it('should disable submit button by default', () => {
        const button = wrapper.find('v-button[data-test=submit-login]');

        expect(button.attributes().disabled).toBeTruthy();
      });
    });
  });
});
