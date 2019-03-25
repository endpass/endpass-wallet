import Web3 from 'web3';
import state from '@/store/transactions';
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  SET_TRANSACTION_HISTORY,
  SET_PENDING_TRANSACTIONS_FILTER_ID,
} from '@/store/transactions/mutations-types';
import cryptoDataService from '@/services/cryptoData';
import {
  EventEmitter,
  Transaction,
  TransactionFactory,
  NotificationError,
  web3,
  Wallet,
} from '@/class';
import { TRANSACTION_STATUS } from '@/constants';
import { address } from 'fixtures/accounts';
import {
  transactionHash,
  shortTransactionHash,
  blockTransactions,
  ethplorerHistory,
  ethplorerTransactions,
} from 'fixtures/transactions';
import {
  pendingTransactions,
  emptyPendingTransactions,
  cryptoDataHistory,
} from 'fixtures/cryptoData';

const { state: transactionsState, actions } = state;

describe('transactions actions', () => {
  let commit;
  let dispatch;
  let getters;
  let rootState;
  let rootGetters;
  let stateInstance;
  let transaction;

  beforeEach(() => {
    web3.eth.getTransactionCount = jest.fn().mockResolvedValue(1);
    web3.eth.sendSignedTransaction = jest.fn(() => ({
      once: jest.fn().mockReturnThis(),
      then: jest.fn().mockReturnThis(),
      catch: jest.fn(),
    }));
    transaction = {
      ...ethplorerTransactions[0],
      nonce: 1,
    };
    stateInstance = {
      ...transactionsState,
    };
    commit = jest.fn();
    dispatch = jest.fn();
    getters = {
      getPendingTransactionByHash: () => ({
        hash: '0x0',
        nonce: 1,
      }),
    };
    rootState = {
      accounts: {
        address,
        wallets: {
          [address]: {},
        },
      },
      web3: {
        activeNet: { id: 2 },
      },
    };
    rootGetters = {
      'accounts/wallet': {
        signTransaction: jest.fn().mockResolvedValue(),
      },
      'transactions/pendingBalance': 0,
      'accounts/accountAddresses': [address.toLowerCase()],
      'web3/isMainNetwork': false,
      'web3/activeNetwork': 3,
    };
  });

  describe('getNonceInBlock', () => {
    it('should return nonce in current block', async () => {
      expect.assertions(2);

      const res = await actions.getNonceInBlock({ rootState });

      expect(web3.eth.getTransactionCount).toBeCalledWith(address);
      expect(res).toEqual('1');
    });
  });

  describe('getNextNonce', () => {
    it('should return next nonce', async () => {
      expect.assertions(2);

      dispatch.mockResolvedValueOnce('1');

      Object.assign(stateInstance, {
        pendingTransactions: [
          {
            nonce: '2',
          },
          {
            nonce: '1',
          },
        ],
      });

      const res = await actions.getNextNonce({
        state: stateInstance,
        dispatch,
      });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(res).toEqual('3');
    });
  });

  describe('handleSendingError', () => {
    const defaultErrorParams = {
      title: 'Error sending transaction',
      text: `Transaction was not sent`,
      type: 'is-danger',
    };

    it('should handle errors with undefined param', () => {
      actions.handleSendingError({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'errors/emitError',
        new NotificationError(defaultErrorParams),
        { root: true },
      );
    });

    it('should handle errors with undefined err param', () => {
      actions.handleSendingError({ dispatch }, { err: undefined });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'errors/emitError',
        new NotificationError(defaultErrorParams),
        { root: true },
      );
    });

    it('should handle errors with undefined transaction param', () => {
      actions.handleSendingError({ dispatch }, { transaction: undefined });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'errors/emitError',
        new NotificationError(defaultErrorParams),
        { root: true },
      );
    });

    it('should notify with semantic message if transaction out of gas', () => {
      actions.handleSendingError(
        { dispatch },
        {
          transaction: {
            hash: transactionHash,
          },
          err: {
            message: 'out of gas',
          },
        },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'errors/emitError',
        new NotificationError({
          ...defaultErrorParams,
          text: `Transaction ${shortTransactionHash} was not sent, because out of gas`,
        }),
        { root: true },
      );
    });

    it('should notify with semantic message if receip given', () => {
      actions.handleSendingError(
        { dispatch },
        {
          transaction: {
            hash: transactionHash,
          },
          receipt: 'foo',
        },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'errors/emitError',
        new NotificationError({
          ...defaultErrorParams,
          text: `Transaction ${shortTransactionHash} was not sent, because out of gas`,
        }),
        { root: true },
      );
    });

    it('should notify with semantic message if gas is too low', () => {
      actions.handleSendingError(
        { dispatch },
        {
          transaction: {
            hash: transactionHash,
          },
          err: {
            message: 'gas is too low',
          },
        },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'errors/emitError',
        new NotificationError({
          ...defaultErrorParams,
          text: `Transaction ${shortTransactionHash} was not sent, because gas is too low`,
        }),
        { root: true },
      );
    });

    it('should notify with semantic message if gas price is too low', () => {
      actions.handleSendingError(
        { dispatch },
        {
          transaction: {
            hash: transactionHash,
          },
          err: {
            message: 'gas price is too low',
          },
        },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'errors/emitError',
        new NotificationError({
          ...defaultErrorParams,
          text: `Transaction ${shortTransactionHash} was not sent, because gas price is too low`,
        }),
        { root: true },
      );
    });
  });

  describe('updateTransactionHistory', () => {
    it('should recieve transaction history', async () => {
      expect.assertions(2);

      const expectedHistory = cryptoDataHistory.map(trx =>
        TransactionFactory.fromSendForm(trx),
      );

      await actions.updateTransactionHistory({
        dispatch,
        commit,
        rootState,
        rootGetters,
      });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenNthCalledWith(
        1,
        SET_TRANSACTION_HISTORY,
        expectedHistory,
      );
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error();
      cryptoDataService.getTransactionHistory.mockRejectedValueOnce(error);
      await actions.updateTransactionHistory({
        dispatch,
        commit,
        rootState,
        rootGetters,
      });
      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(
        'errors/emitError',
        expect.any(NotificationError),
        {
          root: true,
        },
      );
    });
  });

  describe('handleIncomingTransaction', () => {
    const { handleIncomingTransaction } = actions;
    const transaction = { ...blockTransactions[0] };

    it('should add transaction', () => {
      handleIncomingTransaction(
        { commit, state: stateInstance },
        { transaction },
      );

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(ADD_TRANSACTION, transaction);
    });

    it('should update transaction', () => {
      const pendingTransaction = {
        ...transaction,
        state: 'pending',
      };
      const newTransaction = {
        ...transaction,
        hash: 'hash',
        state: 'success',
      };
      const state = {
        ...stateInstance,
        pendingTransactions: [pendingTransaction],
      };

      handleIncomingTransaction(
        { commit, state },
        { transaction: newTransaction },
      );

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(UPDATE_TRANSACTION, {
        payload: {
          state: newTransaction.state,
        },
        hash: pendingTransaction.hash,
      });
    });

    it("should don't update transaction", () => {
      const pendingTransaction = {
        ...transaction,
        state: 'success',
      };
      const newTransaction = {
        ...transaction,
        hash: 'hash',
        state: 'success',
      };
      const state = {
        ...stateInstance,
        pendingTransactions: [pendingTransaction],
      };

      handleIncomingTransaction(
        { commit, state },
        { transaction: newTransaction },
      );

      pendingTransaction.state = 'pending';
      newTransaction.state = 'pending';

      handleIncomingTransaction(
        { commit, state },
        { transaction: newTransaction },
      );

      expect(commit).toHaveBeenCalledTimes(0);
    });
  });

  describe('handleBlockTransactions', () => {
    it('should show notification of incoming transactions', () => {
      actions.handleBlockTransactions(
        { dispatch, rootState, rootGetters },
        { transactions: blockTransactions },
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        'errors/emitError',
        expect.any(NotificationError),
        { root: true },
      );
    });

    it('should not show notification of incoming transactions', () => {
      const transaction = {
        ...blockTransactions[0],
        from: rootGetters['accounts/accountAddresses'][0],
        to: blockTransactions[0].from,
      };

      actions.handleBlockTransactions(
        { dispatch, rootState, rootGetters },
        { transactions: [transaction] },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).not.toHaveBeenCalledWith(
        'errors/emitError',
        expect.any(NotificationError),
        { root: true },
      );
    });

    it('should update transaction history', () => {
      actions.handleBlockTransactions(
        {
          dispatch,
          rootState,
          rootGetters: {
            ...rootGetters,
            'web3/isMainNetwork': true,
          },
        },
        { transactions: blockTransactions },
      );

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenNthCalledWith(3, 'updateTransactionHistory');
    });

    it('should add transaction to history with network id', () => {
      const networkId = 2;

      actions.handleBlockTransactions(
        { dispatch, rootState, rootGetters },
        { transactions: blockTransactions, networkId },
      );

      const expectedTrx = TransactionFactory.fromBlock({
        ...blockTransactions[0],
        networkId,
      });

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'handleIncomingTransaction', {
        transaction: expect.objectContaining({
          ...expectedTrx,
          date: expect.any(Date),
        }),
      });
    });

    it('should not handle transaction when "to" is null', () => {
      actions.handleBlockTransactions(
        { dispatch, rootState, rootGetters },
        { transactions: [{ ...ethplorerTransactions[1], to: null }] },
      );

      expect(dispatch).toHaveBeenCalledTimes(0);
    });
  });

  describe('sendSignedTransaction', () => {
    it('should send signed transaction and return event emmiter instance', async () => {
      expect.assertions(2);

      const res = await actions.sendSignedTransaction(
        { rootState, dispatch, rootGetters },
        { transaction, password: 'secret' },
      );

      expect(web3.eth.sendSignedTransaction).toHaveBeenCalledTimes(1);
      expect(res).toBeInstanceOf(EventEmitter);
    });

    it('should get next nonce by action if transaction has not nonce', async () => {
      expect.assertions(3);

      Object.assign(transaction, {
        nonce: null,
      });

      const res = await actions.sendSignedTransaction(
        { rootState, dispatch, rootGetters },
        { transaction, password: 'secret' },
      );

      expect(dispatch).toHaveBeenCalledWith('getNextNonce');
      expect(web3.eth.sendSignedTransaction).toHaveBeenCalledTimes(1);
      expect(res).toBeInstanceOf(EventEmitter);
    });

    it('should handle error with action', async () => {
      expect.assertions(2);

      rootGetters['accounts/wallet'].signTransaction.mockRejectedValue();

      await actions.sendSignedTransaction(
        { rootState, dispatch, rootGetters },
        { transaction, password: 'secret' },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('handleSendingError', {
        processdTransaction: transaction,
      });
    });
  });

  describe('sendTransaction', () => {
    it('should send transaction with sign', async () => {
      expect.assertions(2);

      dispatch.mockResolvedValueOnce(expect.anything());

      const payload = {
        transaction,
        password: 'secret',
      };

      await actions.sendTransaction({ dispatch }, payload);

      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'sendSignedTransaction',
        payload,
      );
      expect(dispatch).toHaveBeenNthCalledWith(2, 'processTransactionAction', {
        actionType: 'send',
        transaction,
        sendEvent: expect.anything(),
      });
    });
  });

  describe('resendTransaction', () => {
    it('should resend transaction with sign', async () => {
      expect.assertions(2);

      dispatch.mockResolvedValueOnce(expect.anything());

      const payload = {
        transaction,
        password: 'secret',
      };

      await actions.resendTransaction({ dispatch }, payload);

      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'sendSignedTransaction',
        payload,
      );
      expect(dispatch).toHaveBeenNthCalledWith(2, 'processTransactionAction', {
        actionType: 'resend',
        transaction,
        sendEvent: expect.anything(),
      });
    });
  });

  describe('cancelTransaction', () => {
    it('should cancel transaction with sign', async () => {
      expect.assertions(2);

      dispatch.mockResolvedValueOnce(expect.anything());

      const payload = {
        transaction,
        password: 'secret',
      };

      await actions.cancelTransaction({ dispatch }, payload);

      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'sendSignedTransaction',
        payload,
      );
      expect(dispatch).toHaveBeenNthCalledWith(2, 'processTransactionAction', {
        actionType: 'cancel',
        transaction,
        sendEvent: expect.anything(),
      });
    });
  });

  describe('handleTransactionSendingHash', () => {
    it('should add transaction with commit and return new hash', () => {
      const newHash = '0x0';
      const date = new Date();

      const spy = jest
        .spyOn(Transaction, 'applyProps')
        .mockImplementation((trx, newProps) => {
          const res = { ...trx, ...newProps, date };
          return res;
        });

      actions.handleTransactionSendingHash(
        { commit },
        { transaction, newHash },
      );

      const afterApply = {
        ...transaction,
        date,
        hash: newHash,
        state: 'pending',
      };

      expect(commit).toHaveBeenCalledWith(ADD_TRANSACTION, afterApply);

      spy.mockRestore();
    });
  });

  describe('handleTransactionResendingHash', () => {
    it('should update transaction with commit and return new hash', () => {
      const newHash = '0x0';
      actions.handleTransactionResendingHash(
        { commit },
        { hash: transaction.hash, newHash },
      );

      expect(commit).toHaveBeenCalledWith(UPDATE_TRANSACTION, {
        hash: transaction.hash,
        payload: {
          hash: newHash,
        },
      });
    });
  });

  describe('handleTransactionCancelingHash', () => {
    let sendEvent;
    const newHash = '0x0';

    beforeEach(() => {
      sendEvent = {
        emit: jest.fn(),
      };
    });

    it('should handle error if transaction nonce equals to block nonce', async () => {
      expect.assertions(3);

      dispatch.mockResolvedValueOnce(1);

      await actions.handleTransactionCancelingHash(
        { dispatch, getters },
        { transaction, sendEvent },
      );

      expect(dispatch).toHaveBeenNthCalledWith(1, 'getNonceInBlock');
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        'errors/emitError',
        expect.anything(),
        {
          root: true,
        },
      );
      expect(sendEvent.emit).not.toBeCalled();
    });

    it('should emit event by given emmiter if transaction nonce not equals to block nonce', async () => {
      expect.assertions(3);

      dispatch.mockResolvedValueOnce(99);

      await actions.handleTransactionCancelingHash(
        { dispatch, getters },
        { transaction, sendEvent },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('getNonceInBlock');
      expect(sendEvent.emit).toBeCalledWith('confirmation');
    });
  });

  describe('processTransactionAction', () => {
    let sendEvent;
    const newHash = '0x0';

    beforeEach(() => {
      sendEvent = new EventEmitter();
    });

    it('should send transaction on hash event', () => {
      expect.assertions(2);
      actions
        .processTransactionAction(
          {
            dispatch,
            commit,
          },
          {
            transaction,
            sendEvent,
            actionType: 'send',
          },
        )
        .then(res => {
          expect(dispatch).toHaveBeenCalledWith(
            'handleTransactionSendingHash',
            {
              transaction,
              newHash,
            },
          );
          expect(res).not.toBeNull();
        });

      sendEvent.emit('transactionHash', newHash);
    });

    it('should resend transaction on hash event', () => {
      expect.assertions(2);

      actions
        .processTransactionAction(
          {
            dispatch,
            commit,
          },
          {
            transaction,
            sendEvent,
            actionType: 'resend',
          },
        )
        .then(res => {
          expect(dispatch).toHaveBeenCalledWith(
            'handleTransactionResendingHash',
            {
              hash: transaction.hash,
              newHash,
            },
          );
          expect(res).not.toBeNull();
        });

      sendEvent.emit('transactionHash', newHash);
    });

    it('should cancel transaction on hash event', () => {
      expect.assertions(2);

      actions
        .processTransactionAction(
          {
            dispatch,
            commit,
          },
          {
            transaction,
            sendEvent,
            actionType: 'cancel',
          },
        )
        .then(res => {
          expect(dispatch).toHaveBeenCalledWith(
            'handleTransactionCancelingHash',
            {
              transaction,
              sendEvent,
            },
          );
          expect(res).not.toBeNull();
        });

      sendEvent.emit('transactionHash');
    });
  });

  describe('getPendingTransactions', () => {
    const { getPendingTransactions } = actions;

    it('should correctly call cryptoDataService.getPendingTransactions', async () => {
      expect.assertions(2);

      await getPendingTransactions({
        state,
        commit,
        dispatch,
        rootState,
        rootGetters,
      });

      expect(cryptoDataService.getPendingTransactions).toHaveBeenCalledTimes(1);
      expect(cryptoDataService.getPendingTransactions).toHaveBeenCalledWith(
        rootGetters['web3/activeNetwork'],
        rootState.accounts.address,
        state.pendingTransactionsFilterId,
      );
    });

    it('should save pendingTransactionsFilterId', async () => {
      expect.assertions(2);

      cryptoDataService.getPendingTransactions.mockResolvedValueOnce(
        emptyPendingTransactions,
      );
      await getPendingTransactions({
        state,
        commit,
        dispatch,
        rootState,
        rootGetters,
      });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(
        SET_PENDING_TRANSACTIONS_FILTER_ID,
        emptyPendingTransactions.filterId,
      );
    });

    it("should don't save pendingTransactionsFilterId", async () => {
      expect.assertions(1);

      const state = {
        pendingTransactionsFilterId: emptyPendingTransactions.filterId,
      };

      cryptoDataService.getPendingTransactions.mockResolvedValueOnce(
        emptyPendingTransactions,
      );
      await getPendingTransactions({
        state,
        commit,
        dispatch,
        rootState,
        rootGetters,
      });

      expect(commit).toHaveBeenCalledTimes(0);
    });

    it('should add new pending transactions', async () => {
      const pendingTransactionsCount = pendingTransactions.transactions.length;

      expect.assertions(pendingTransactionsCount + 1);

      const state = {
        pendingTransactionsFilterId: pendingTransactions.filterId,
      };

      await getPendingTransactions({
        state,
        commit,
        dispatch,
        rootState,
        rootGetters,
      });

      expect(dispatch).toHaveBeenCalledTimes(pendingTransactionsCount);

      pendingTransactions.transactions.forEach((transaction, index) => {
        const trx = Transaction.applyProps(
          TransactionFactory.fromCryptoData(transaction),
          {
            state: TRANSACTION_STATUS.PENDING,
          },
        );

        expect(dispatch).toHaveBeenNthCalledWith(
          index + 1,
          'handleIncomingTransaction',
          {
            transaction: expect.objectContaining({
              ...trx,
              date: expect.any(Date),
            }),
          },
        );
      });
    });

    it("should don't add new pending transactions", async () => {
      expect.assertions(1);

      const state = {
        pendingTransactionsFilterId: emptyPendingTransactions.filterId,
      };

      cryptoDataService.getPendingTransactions.mockResolvedValueOnce(
        emptyPendingTransactions,
      );
      await getPendingTransactions({
        state,
        commit,
        dispatch,
        rootState,
        rootGetters,
      });

      expect(commit).toHaveBeenCalledTimes(0);
    });

    it('should handle error', async () => {
      expect.assertions(2);

      const error = new Error();

      cryptoDataService.getPendingTransactions.mockRejectedValueOnce(error);
      await getPendingTransactions({
        state,
        commit,
        dispatch,
        rootState,
        rootGetters,
      });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('updatePendingTransactionsStatus', () => {
    const { updatePendingTransactionsStatus } = actions;
    const hash = 'transaction hash';
    let state;

    beforeEach(() => {
      state = {
        pendingTransactions: [
          {
            hash,
            state: TRANSACTION_STATUS.PENDING,
            networkId: rootGetters['web3/activeNetwork'],
          },
        ],
      };
    });

    it('should not update transactions', async () => {
      expect.assertions(2);

      let state = {
        pendingTransactions: [],
      };

      await updatePendingTransactionsStatus({ state, commit, rootGetters });
      expect(commit).toHaveBeenCalledTimes(0);

      state = {
        pendingTransactions: [
          {
            state: TRANSACTION_STATUS.SUCCESS,
            networkId: rootGetters['web3/activeNetwork'],
          },
          {
            state: TRANSACTION_STATUS.PENDING,
            networkId: rootGetters['web3/activeNetwork'] + 1,
          },
        ],
      };

      await updatePendingTransactionsStatus({ state, commit, rootGetters });
      expect(commit).toHaveBeenCalledTimes(0);
    });

    it('should not update transactions if it still pending', async () => {
      expect.assertions(1);

      Web3.eth.getTransactionReceipt.mockResolvedValueOnce(null);

      await updatePendingTransactionsStatus({ state, commit, rootGetters });

      expect(commit).toHaveBeenCalledTimes(0);
    });

    it('should set success transaction status', async () => {
      expect.assertions(2);

      Web3.eth.getTransactionReceipt.mockResolvedValueOnce({
        status: true,
      });

      await updatePendingTransactionsStatus({ state, commit, rootGetters });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(UPDATE_TRANSACTION, {
        payload: {
          state: TRANSACTION_STATUS.SUCCESS,
        },
        hash,
      });
    });

    it('should set error transaction status', async () => {
      expect.assertions(2);

      Web3.eth.getTransactionReceipt.mockResolvedValueOnce({
        status: false,
      });

      await updatePendingTransactionsStatus({ state, commit, rootGetters });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenCalledWith(UPDATE_TRANSACTION, {
        payload: {
          state: TRANSACTION_STATUS.ERROR,
        },
        hash,
      });
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new NotificationError({
        title: 'Failed to update pending transactions',
        text: 'An error occurred while updating pending transactions.',
        type: 'is-warning',
      });

      Web3.eth.getTransactionReceipt.mockRejectedValueOnce();

      await updatePendingTransactionsStatus({
        state,
        commit,
        rootGetters,
        dispatch,
      });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });
});
