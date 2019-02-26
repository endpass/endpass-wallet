import Vuex from 'vuex';
import Web3 from 'web3';
import { createLocalVue } from '@vue/test-utils';
import Notifications from 'vue-notification';
import { wrapShallowMountFactory } from '@/testUtils';

import Send from '@/components/pages/Send/index.vue';
import { TransactionFactory } from '@/class';

import { checksumAddress, v3password } from 'fixtures/accounts';
import { transactionHash, shortTransactionHash } from 'fixtures/transactions';

const localVue = createLocalVue();

localVue.use(Vuex);
localVue.use(Notifications);

describe('Send', () => {
  const web3Instance = new Web3('https://mainnet.infura.io/');
  const transactionsActions = {
    getNextNonce: jest.fn(() => 1),
    getNonceInBlock: jest.fn(() => 1),
    sendTransaction: jest.fn().mockResolvedValue(transactionHash),
  };
  let store;
  let wrapper;
  let wrapperFactory;

  beforeEach(() => {
    jest.clearAllMocks();

    store = new Vuex.Store({
      state: {
        user: {
          settings: {
            fiatCurrency: 'USD',
          },
        },
        web3: {
          web3: web3Instance,
          activeCurrency: {
            name: 'ETH',
          },
          activeNet: {
            id: 1,
          },
        },
        connectionStatus: {
          isSyncing: false,
        },
      },
      modules: {
        accounts: {
          namespaced: true,
          state: {
            address: checksumAddress,
            balance: '1000000000000000000',
            pendingTransactions: [
              {
                timestamp: 1524505925,
                from: '0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b',
                to: '0x7c59542b20002ed255598172cab48b86d865dfbb',
                hash:
                  '0x7fcb1e71def6d0d353251831f46d60401e6321b5e0b0b135085be4688ca2a9b1',
                value: 0.009979,
                input: '0x',
                success: true,
              },
            ],
            wallets: () => [],
            wallet: {
              isPublic: false,
            },
          },
          getters: {
            isPublicAccount: () => true,
          },
        },
        transactions: {
          namespaced: true,
          actions: transactionsActions,
          getters: {
            addressesFromTransactions: () => [],
          },
        },
      },
    });
    wrapperFactory = wrapShallowMountFactory(Send, {
      store,
      localVue,
      sync: false,
    });
    wrapper = wrapperFactory();
  });

  describe('render', () => {
    it('should not render any modals by default', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render transaction modal if transaction waiting confirm', () => {
      wrapper.setData({
        isWaitingConfirm: true,
      });

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render password modal if transaction confirmed', () => {
      wrapper.setData({
        isTransactionConfirmed: true,
      });

      expect(wrapper.html()).toMatchSnapshot();
    });

    it('should render transaction hash if it not empty', async () => {
      expect.assertions(2);

      wrapper.setData({
        transactionHash: '0x0',
      });

      wrapper.vm.$forceUpdate();
      await wrapper.vm.$nextTick();

      expect(wrapper.html()).toMatchSnapshot();
      expect(wrapper.find('[data-test=transaction-status] .code').text()).toBe(
        '0x0',
      );
    });
  });

  describe('behavior', () => {
    it('should request next nonce on mount and apply result to transaction', () => {
      expect(transactionsActions.getNextNonce).toBeCalledTimes(1);
      expect(wrapper.vm.transaction.nonce).toBe(1);
    });

    it('should request next nonce on change active net and address', () => {
      wrapper = wrapperFactory({
        computed: {
          activeNet: 'foo',
        },
      });

      expect(transactionsActions.getNextNonce).toBeCalledTimes(2);

      wrapper = wrapperFactory({
        computed: {
          address: 'foo',
        },
      });

      expect(transactionsActions.getNextNonce).toBeCalledTimes(3);
    });

    it('should show transaction modal on transaction send', async () => {
      expect.assertions(2);

      wrapper.vm.handleTransactionSend();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.isWaitingConfirm).toBe(true);
      expect(wrapper.find('transaction-modal-stub').exists()).toBe(true);
    });

    it('should show password modal on transaction confirm and hide transaction modal', async () => {
      expect.assertions(4);

      wrapper.setData({
        isWaitingConfirm: true,
      });

      wrapper.vm.confirmTransaction();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.isWaitingConfirm).toBe(false);
      expect(wrapper.vm.isTransactionConfirmed).toBe(true);
      expect(wrapper.find('transaction-modal-stub').exists()).toBe(false);
      expect(wrapper.find('password-modal-stub').exists()).toBe(true);
    });

    it('should close transaction modal on send cancel', async () => {
      expect.assertions(2);

      wrapper.setData({
        isWaitingConfirm: true,
      });

      wrapper.vm.cancelTransaction();
      await await wrapper.vm.$nextTick();

      expect(wrapper.vm.isWaitingConfirm).toBe(false);
      expect(wrapper.find('transaction-modal-stub').exists()).toBe(false);
    });

    it('should close password modal on send cancel', async () => {
      expect.assertions(2);

      wrapper.setData({
        isTransactionConfirmed: true,
      });

      wrapper.vm.cancelTransaction();
      await await wrapper.vm.$nextTick();

      expect(wrapper.vm.isTransactionConfirmed).toBe(false);
      expect(wrapper.find('password-modal-stub').exists()).toBe(false);
    });

    it('should reset form with default transaction', async () => {
      expect.assertions(2);

      const defaultTx = { ...wrapper.vm.transaction };
      const checkTrx = { name: 'foo' };

      wrapper.setData({
        transaction: checkTrx,
      });

      await wrapper.vm.resetForm();
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.transaction).not.toBe(checkTrx);
      expect(wrapper.vm.transaction).toEqual(defaultTx);
    });

    describe('sendConfirmedTransaction', () => {
      beforeEach(() => {
        jest.spyOn(wrapper.vm, '$notify');
        jest.spyOn(wrapper.vm, 'resetForm');
      });

      it('should handle send transaction and reset form', async () => {
        expect.assertions(8);

        const defaultTx = { ...wrapper.vm.transaction };

        await wrapper.vm.sendConfirmedTransaction(v3password);

        expect(transactionsActions.sendTransaction).toBeCalledTimes(1);
        expect(transactionsActions.sendTransaction).toBeCalledWith(
          expect.any(Object),
          {
            transaction: TransactionFactory.fromSendForm({
              ...defaultTx,
              from: checksumAddress,
              networkId: 1,
            }),
            password: v3password,
          },
          undefined,
        );
        expect(wrapper.vm.$notify).toBeCalledTimes(1);
        expect(wrapper.vm.$notify).toBeCalledWith({
          title: 'Transaction Sent',
          text: `Transaction ${shortTransactionHash} sent`,
          type: 'is-info',
        });
        expect(wrapper.vm.resetForm).toBeCalledTimes(1);
        expect(wrapper.vm.isSending).toBe(false);
        expect(wrapper.vm.isTransactionConfirmed).toBe(false);
        expect(wrapper.vm.isWaitingConfirm).toBe(false);
      });

      it('should handle error  and reset form', async () => {
        expect.assertions(5);

        wrapper.setData({
          transactionHash: '0x0',
        });

        transactionsActions.sendTransaction.mockRejectedValueOnce(new Error());

        await wrapper.vm.sendConfirmedTransaction(v3password);

        expect(wrapper.vm.transactionHash).toBe(null);
        expect(wrapper.vm.resetForm).toBeCalledTimes(1);
        expect(wrapper.vm.isSending).toBe(false);
        expect(wrapper.vm.isTransactionConfirmed).toBe(false);
        expect(wrapper.vm.isWaitingConfirm).toBe(false);
      });
    });

    describe('updateNonceWithClearHash', () => {
      it('should update nonce and reset transaction hash if it not empty', async () => {
        expect.assertions(3);

        wrapper.setData({
          transactionHash: '0x0',
        });

        transactionsActions.getNextNonce.mockClear();
        await wrapper.vm.updateNonceWithClearHash();

        expect(transactionsActions.getNextNonce).toBeCalledTimes(1);
        expect(wrapper.vm.transaction.nonce).toBe(1);
        expect(wrapper.vm.transactionHash).toBe(null);
      });
    });
  });
});
