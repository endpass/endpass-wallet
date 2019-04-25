import { shallowMount, createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import UIComponents from '@endpass/ui';

import RecoverTransaction from '@/components/RecoverTransaction';

import { ethplorerTransactions } from 'fixtures/transactions';

describe('RecoverTransaction', () => {
  let wrapper;

  beforeEach(() => {
    const localVue = createLocalVue();

    localVue.use(Notifications);
    localVue.use(UIComponents);

    wrapper = shallowMount(RecoverTransaction, {
      localVue,
    });
  });

  describe('render', () => {
    it('should render the initial state of the component', () => {
      expect(wrapper.element).toMatchSnapshot();
    });

    it('should enable "Recover" button', () => {
      wrapper.setData({
        transactionHash: '0x0',
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should disable "Recover" button', () => {
      wrapper.setData({
        transactionHash: '',
      });

      expect(wrapper.element).toMatchSnapshot();
    });

    it('should show restored transaction data', () => {
      wrapper.setData({
        recoveredTransaction: ethplorerTransactions[0],
      });

      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      jest.spyOn(wrapper.vm, '$notify');
    });

    describe('verifyTransaction', () => {
      it('should restore transaction from hash', () => {
        wrapper.setData({
          transactionHash:
            '0xdd80808094b41e54248facd542165a4fcb53fb980e4ac88db580801c8080',
        });

        wrapper.vm.recoverTransaction();

        expect(wrapper.vm.recoveredTransaction).toBeInstanceOf(Object);
        expect(wrapper.vm.$notify).not.toHaveBeenCalled();
      });

      it('should not recover transaction', () => {
        global.console.error = jest.fn();

        wrapper.setData({
          transactionHash: null,
        });
        wrapper.vm.recoverTransaction();

        expect(wrapper.vm.recoveredTransaction).toBeNull();
        expect(wrapper.vm.$notify).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.$notify).toHaveBeenCalledWith({
          title: 'Error while recovering the transaction',
          text:
            'An error occurred while recovering the transaction. Please try again.',
          type: 'is-danger',
        });
      });
    });
  });
});
