import { shallow, createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import VerifyMessage from '@/components/VerifyMessage';
import ethereumWalletMock from 'fixtures/wallet';
import { generateStubs } from '@/utils/testUtils';
import web3 from '@/utils/web3';

describe('VerifyMessage', () => {
  const address = 'address';
  let wrapper;
  let $store;
  beforeEach(() => {
    const localVue = createLocalVue();
    $store = {
      state: {
        web3: {},
        accounts: {
          wallet: ethereumWalletMock,
        },
      },
    };

    localVue.use(Notifications);

    wrapper = shallow(VerifyMessage, {
      localVue,
      mocks: { $store },
      stubs: generateStubs(VerifyMessage),
    });
  });

  describe('render', () => {
    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should enable "Verify message" button', () => {
      wrapper.setData({
        signedMessageString: '{}',
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should disable "Verify message" button', () => {
      wrapper.setData({
        signedMessageString: 'string',
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should show the received address', () => {
      wrapper.setData({ address });

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('verifyMessage', () => {
      beforeEach(() => {
        spyOn(wrapper.vm, '$notify');
      });

      it('should verify message', () => {
        const { vm } = wrapper;
        wrapper.setData({
          signedMessageString: '{}',
        });

        vm.verifyMessage();

        expect(vm.address).toEqual($store.state.accounts.wallet.getAddress());
        expect(vm.$notify).not.toHaveBeenCalled();
      });

      it('should not verify message', () => {
        const { vm } = wrapper;

        web3.eth.accounts.recover = jest.fn(() => {
          throw new Error();
        });

        global.console.error = jest.fn();

        vm.verifyMessage();

        expect(vm.address).toBeNull();
        expect(vm.$notify).toHaveBeenCalledTimes(1);
        expect(vm.$notify).toHaveBeenCalledWith({
          title: 'Error while verifying the message',
          text:
            'An error occurred while verifying the message. Please try again.',
          type: 'is-danger',
        });
      });
    });
  });
});
