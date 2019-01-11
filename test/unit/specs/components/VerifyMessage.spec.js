import Vuex from 'vuex';
import { shallow, createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import VerifyMessage from '@/components/VerifyMessage';
import ethereumWalletMock from 'fixtures/wallet';
import { address } from 'fixtures/accounts';
import web3 from '@/class/singleton/web3';

const localVue = createLocalVue();

localVue.use(Notifications);
localVue.use(Vuex);

describe('VerifyMessage', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          getters: {
            wallet: () => ethereumWalletMock,
          },
        },
      },
      state: {
        web3: {},
      },
    });

    wrapper = shallow(VerifyMessage, {
      localVue,
      store,
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
        jest.spyOn(wrapper.vm, '$notify');
      });

      it('should verify message', async () => {
        expect.assertions(2);

        const { vm } = wrapper;

        web3.eth.accounts.recover = jest.fn().mockResolvedValueOnce(address);
        wrapper.setData({
          signedMessageString: '{}',
        });

        await vm.verifyMessage();

        expect(vm.address).toEqual(ethereumWalletMock.getAddress());
        expect(vm.$notify).not.toHaveBeenCalled();
      });

      it('should not verify message', async () => {
        expect.assertions(3);

        const { vm } = wrapper;

        web3.eth.accounts.recover = jest.fn(() => {
          throw new Error();
        });

        global.console.error = jest.fn();

        await vm.verifyMessage();

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
