import Vuex from 'vuex';
import { ethplorerTransactions } from 'fixtures/transactions';
import { mount, createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import SignTransaction from '@/components/SignTransaction';
import { testUtils } from '@endpass/utils';

describe('SignTransaction', () => {
  let wrapper;

  beforeEach(() => {
    const localVue = createLocalVue();

    localVue.use(Notifications);
    localVue.use(Vuex);

    const store = new Vuex.Store({
      modules: {
        accounts: {
          namespaced: true,
          getters: {
            wallet: () => ({
              getPrivateKey: jest.fn(() => 'private key'),
            }),
          },
        },
      },
      state: {
        web3: {},
      },
    });

    wrapper = mount(SignTransaction, {
      store,
      localVue,
      stubs: testUtils.generateStubs(SignTransaction),
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
      wrapper.setData({
        signedTransaction: '0x0',
      });

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
        expect.assertions(3);

        wrapper.vm.wallet.signTransaction = jest
          .fn()
          .mockResolvedValueOnce('0x0');
        wrapper.setData({
          transaction: '{}',
        });

        await wrapper.vm.signTransaction(password);

        expect(wrapper.vm.signedTransaction).toEqual('0x0');
        expect(wrapper.vm.wallet.signTransaction).toBeCalled();
        expect(wrapper.vm.$notify).not.toHaveBeenCalled();
      });

      it('should not sign message', async () => {
        expect.assertions(3);

        wrapper.vm.wallet.signTransaction = jest.fn(() => {
          throw new Error();
        });
        global.console.error = jest.fn();

        await wrapper.vm.signTransaction(password);

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
