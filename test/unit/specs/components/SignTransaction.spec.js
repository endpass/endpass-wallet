import Vuex from 'vuex';
import { ethplorerTransactions } from 'fixtures/transactions';
import { mount, createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import SignTransaction from '@/components/SignTransaction';
import { generateStubs } from '@/utils/testUtils';

describe('SignTransaction', () => {
  const signedTransaction = {
    serialize: () => ({
      toString: () => 'foo',
    }),
  };
  let wrapper;

  beforeEach(() => {
    const localVue = createLocalVue();
    const store = new Vuex.Store({
      state: {
        accounts: {
          wallet: {
            getPrivateKey: jest.fn(() => 'private key'),
          },
        },
        web3: {},
        transactions: {
          actions: {
            signTransaction: () => Promise.resolve('hash'),
          },
        },
      },
    });

    localVue.use(Notifications);

    wrapper = mount(SignTransaction, {
      store,
      localVue,
      stubs: generateStubs(SignTransaction),
    });
  });

  describe('render', () => {
    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should enable "Sign transaction" button', () => {
      wrapper.setData({
        transaction: JSON.stringify(ethplorerTransactions[0]),
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should show signed message', () => {
      wrapper.setData({ signedTransaction });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should show modal window for password confirmation', () => {
      wrapper.setData({
        transaction: JSON.stringify(ethplorerTransactions[0]),
        isPasswordModal: true,
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('signTransaction', () => {
      const password = 'password';

      beforeEach(() => {
        spyOn(wrapper.vm, '$notify');
      });

      it('should sign transaction', async () => {
        expect.assertions(2);

        wrapper.vm.signTransaction = jest.fn().mockResolvedValueOnce('0x0');
        wrapper.setData({
          transaction: JSON.stringify(ethplorerTransactions[0]),
        });

        await wrapper.vm.signTransactionString(password);

        expect(wrapper.vm.signedTransaction).toEqual('0x0');
        expect(wrapper.vm.$notify).not.toHaveBeenCalled();
      });

      it('should not sign message', async () => {
        expect.assertions(3);

        wrapper.vm.signTransaction = jest.fn(() => {
          throw new Error();
        });
        global.console.error = jest.fn();

        wrapper.setData({
          transaction: null,
        });

        await wrapper.vm.signTransactionString(password);

        expect(wrapper.vm.signedTransaction).toBeNull();
        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$notify).toHaveBeenCalledWith({
          title: 'Error signing transaction',
          text:
            'An error occurred while signing the transaction. Please try again.',
          type: 'is-danger',
        });
      });
    });
  });
});
