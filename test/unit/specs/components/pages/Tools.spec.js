import { shallow, createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification'
import VForm from '@/components/ui/form/VForm.vue';
import VButton from '@/components/ui/form/VButton.vue';
import ToolsPage from '@/components/pages/Tools.vue';

describe('Tools page', () => {
  const signedMessage = {};
  let wrapper;

  beforeEach(() => {
    const localVue = createLocalVue();
    const $store = {
      state: {
        accounts: {
          wallet: {
            getPrivateKey: jest.fn(() => 'private key')
          }
        },
        web3: {
          web3: {
            eth: {
              accounts: {
                sign: jest.fn(() => signedMessage)
              }
            }
          }
        }
      }
    };

    localVue.use(Notifications);

    wrapper = shallow(ToolsPage, {
      localVue,
      mocks: { $store },
      stubs: {
        'v-form': VForm,
        'v-button': VButton
      }
    });
  });

  describe('render', () => {
    it('should render the initial state of the page', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should enable "Sign message" button', () => {
      wrapper.setData({
        signingMessage: {
          message: 'message'
        }
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should show signed message', () => {
      const signedMessage = { message: 'message' };

      wrapper.setData({
        signingMessage: { signedMessage }
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('togglePasswordModal', () => {
      it('should toggle password modal', () => {
        const { vm } = wrapper;
        let isPasswordModal = vm.isPasswordModal;

        vm.togglePasswordModal();
        expect(vm.isPasswordModal).toBe(!isPasswordModal);

        isPasswordModal = vm.isPasswordModal;
        vm.togglePasswordModal();
        expect(vm.isPasswordModal).toBe(!isPasswordModal);
      });
    });

    describe('signMessage', () => {
      const password = 'password';

      beforeEach(() => {
        spyOn(wrapper.vm, '$notify');
      });

      it('should sign message', () => {
        const { vm } = wrapper;

        vm.signMessage(password);

        expect(vm.signingMessage.signedMessage).toEqual(signedMessage);
        expect(vm.$notify).not.toHaveBeenCalled();
      });

      it('should not sign message', () => {
        const { vm } = wrapper;

        vm.$store.state.web3.web3.eth.accounts.sign = jest.fn(() => {
          throw new Error();
        });
        vm.signMessage(password);

        expect(vm.signingMessage.signedMessage).toBeNull();
        expect(vm.$notify).toHaveBeenCalledTimes(1);
        expect(vm.$notify).toHaveBeenCalledWith({
          title: 'Error signing message',
          text: 'An error occurred while signing the message. Please try again.',
          type: 'is-danger',
        });
      });
    });
  });
});
