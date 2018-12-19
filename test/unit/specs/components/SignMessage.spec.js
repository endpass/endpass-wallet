import Vuex from 'vuex';
import { shallow, createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import SignMessage from '@/components/SignMessage';
import { generateStubs } from '@/utils/testUtils';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Notifications);

describe('SignMessage', () => {
  const signedMessage = {};
  const sign = jest.fn().mockResolvedValue(signedMessage);
  let wrapper;
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          getters: {
            wallet: () => ({
              getPrivateKeyString: jest.fn(() => 'private key string'),
              sign,
            }),
          },
        },
      },
      state: {
        web3: {},
      },
    });

    wrapper = shallow(SignMessage, {
      localVue,
      store,
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
        jest.spyOn(wrapper.vm, '$notify');
      });

      it('should sign message', async () => {
        expect.assertions(2);

        const { vm } = wrapper;

        await vm.signMessage(password);

        expect(vm.signedMessage).toEqual(signedMessage);
        expect(vm.$notify).not.toHaveBeenCalled();
      });

      it('should not sign message', async () => {
        expect.assertions(3);

        const { vm } = wrapper;

        sign.mockRejectedValueOnce(new Error());

        global.console.error = jest.fn();

        await vm.signMessage(password);

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
