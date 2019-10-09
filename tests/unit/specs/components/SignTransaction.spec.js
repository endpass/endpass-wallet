import Vuex from 'vuex';
import Notifications from 'vue-notification';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import UIComponents from '@endpass/ui';

import { ethplorerTransactions } from 'fixtures/transactions';
import SignTransaction from '@/components/SignTransaction';


describe('SignTransaction', () => {
  let wrapper;

  beforeEach(() => {
    const localVue = createLocalVue();

    localVue.use(Notifications);
    localVue.use(Vuex);
    localVue.use(UIComponents);

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

    wrapper = shallowMount(SignTransaction, {
      store,
      localVue,
      sync: false,
    });
  });

  describe('render', () => {
    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should enable "Sign transaction" button', async () => {
      expect.assertions(1);

      wrapper.setData({
        transaction: JSON.stringify(ethplorerTransactions[0]),
      });

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should show signed message', async () => {
      expect.assertions(1);

      wrapper.setData({
        signedTransaction: '0x0',
      });

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should show modal window for password confirmation', async () => {
      expect.assertions(1);

      wrapper.setData({
        transaction: JSON.stringify(ethplorerTransactions[0]),
        isPasswordModal: true,
      });

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    describe('signTransaction', () => {
      const password = 'password';

      beforeEach(() => {
        jest.spyOn(wrapper.vm, '$notify');
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
