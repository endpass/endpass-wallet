import { shallow, createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import SignMessage from '@/components/SignMessage';
import { generateStubs } from '@/utils/testUtils';
import web3 from '@/utils/web3';

describe('SignMessage', () => {
  const signedMessage = {};
  let wrapper;

  beforeEach(() => {
    const localVue = createLocalVue();
    const $store = {
      state: {
        accounts: {
          wallet: {
            getPrivateKey: jest.fn(() => 'private key'),
          },
        },
        web3: {},
      },
    };

    localVue.use(Notifications);

    wrapper = shallow(SignMessage, {
      localVue,
      mocks: { $store },
      stubs: generateStubs(SignMessage),
    });
  });

  describe('render', () => {
    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should enable "Sign message" button', () => {
      wrapper.setData({
        message: 'message',
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should show signed message', () => {
      const signedMessage = { message: 'message' };

      wrapper.setData({ signedMessage });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should show modal window for password confirmation', () => {
      wrapper.setData({
        message: 'message',
        isPasswordModal: true,
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('signMessage', () => {
      const password = 'password';

      beforeEach(() => {
        spyOn(wrapper.vm, '$notify');
      });

      it('should sign message', () => {
        web3.eth.accounts.sign = jest.fn(() => signedMessage);
        const { vm } = wrapper;

        vm.signMessage(password);

        expect(vm.signedMessage).toEqual(signedMessage);
        expect(vm.$notify).not.toHaveBeenCalled();
      });

      it('should not sign message', () => {
        const { vm } = wrapper;

        web3.eth.accounts.sign = jest.fn(() => {
          throw new Error();
        });

        global.console.error = jest.fn();

        vm.signMessage(password);

        expect(vm.signedMessage).toBeNull();
        expect(vm.$notify).toHaveBeenCalledTimes(1);
        expect(vm.$notify).toHaveBeenCalledWith({
          title: 'Error signing message',
          text:
            'An error occurred while signing the message. Please try again.',
          type: 'is-danger',
        });
      });
    });
  });
});
