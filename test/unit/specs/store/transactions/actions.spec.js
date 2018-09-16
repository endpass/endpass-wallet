import web3 from '@/utils/web3';
import state from '@/store/transactions';
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  SET_TRANSACTION_HISTORY,
} from '@/store/transactions/mutations-types';
import ethplorerService from '@/services/ethplorer';
import { EventEmitter, Transaction, NotificationError } from '@/class';

import { address } from 'fixtures/accounts';
import { ethplorerHistory, ethplorerTransactions } from 'fixtures/transactions';

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
      once() {
        return this;
      },
      then: jest.fn(),
    }));
    transaction = {
      ...ethplorerTransactions[0],
      nonce: 1,
      getApiObject: jest.fn(),
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
        address: {
          getChecksumAddressString: jest.fn(() => address),
          getAddressString: () => address.toLowerCase(),
        },
        wallets: {
          [address]: {},
        },
        wallet: {
          signTransaction: jest.fn().mockResolvedValue(),
        },
      },
      web3: {
        activeNet: { id: 2 },
      },
    };
    rootGetters = {
      'transactions/pendingBalance': 0,
      'accounts/getAccountAddresses': [address.toLowerCase()],
      'web3/isMainNetwork': false,
    };
  });

  describe('getNonceInBlock', () => {
    it('should return nonce in current block', async () => {
      expect.assertions(3);

      const res = await actions.getNonceInBlock({ rootState });

      expect(rootState.accounts.address.getChecksumAddressString).toBeCalled();
      expect(web3.eth.getTransactionCount).toBeCalledWith(address);
      expect(res).toEqual(1);
    });
  });

  describe('getNextNonce', () => {
    it('should return next nonce', async () => {
      expect.assertions(2);

      dispatch.mockResolvedValueOnce(1);

      Object.assign(stateInstance, {
        pendingTransactions: [
          {
            nonce: 1,
          },
          {
            nonce: 2,
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
    it('should handle errors with undefined param', () => {
      actions.handleSendingError({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it('should handle errors with undefined err param', () => {
      actions.handleSendingError({ dispatch }, { err: undefined });

      expect(dispatch).toHaveBeenCalledTimes(1);
    });

    it('should handle errors with undefined transaction param', () => {
      actions.handleSendingError({ dispatch }, { transaction: undefined });

      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateTransactionHistory', () => {
    it('should recieve transaction history', async () => {
      expect.assertions(2);

      const expectedHistory = []
        .concat(ethplorerTransactions, ethplorerHistory)
        .map(tx => new Transaction(tx));

      ethplorerService.getHistory = jest
        .fn()
        .mockResolvedValue(ethplorerHistory);
      ethplorerService.getInfo = jest
        .fn()
        .mockResolvedValue(ethplorerTransactions);

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

      ethplorerService.getHistory = jest.fn().mockRejectedValue(error);
      ethplorerService.getInfo = jest.fn().mockRejectedValue(error);

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

  describe('handleBlockTransactions', () => {
    it('should show notification of incoming transactions', () => {
      actions.handleBlockTransactions(
        { dispatch, rootState, rootGetters },
        ethplorerTransactions,
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
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
        ethplorerTransactions,
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'errors/emitError',
        expect.any(NotificationError),
        { root: true },
      );
      expect(dispatch).toHaveBeenNthCalledWith(2, 'updateTransactionHistory');
    });
  });

  describe('sendSignedTransaction', () => {
    it('should send signed transaction and return event emmiter instance', async () => {
      expect.assertions(2);

      const res = await actions.sendSignedTransaction(
        { rootState, dispatch },
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
        { rootState, dispatch },
        { transaction, password: 'secret' },
      );

      expect(dispatch).toHaveBeenCalledWith('getNextNonce');
      expect(web3.eth.sendSignedTransaction).toHaveBeenCalledTimes(1);
      expect(res).toBeInstanceOf(EventEmitter);
    });

    it('should handle error with action', async () => {
      expect.assertions(2);

      rootState.accounts.wallet.signTransaction.mockRejectedValue();

      await actions.sendSignedTransaction(
        { rootState, dispatch },
        { transaction, password: 'secret' },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('handleSendingError', {
        transaction,
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
      const res = actions.handleTransactionSendingHash(
        { commit },
        { transaction, newHash },
      );

      expect(commit).toHaveBeenCalledWith(ADD_TRANSACTION, transaction);
      expect(res).toEqual(newHash);
    });
  });

  describe('handleTransactionResendingHash', () => {
    it('should update transaction with commit and return new hash', () => {
      const newHash = '0x0';
      const res = actions.handleTransactionResendingHash(
        { commit },
        { transaction, newHash },
      );

      expect(commit).toHaveBeenCalledWith(UPDATE_TRANSACTION, {
        hash: transaction.hash,
        payload: {
          hash: newHash,
        },
      });
      expect(res).toEqual(newHash);
    });
  });

  describe('handleTransactionCancelingHash', () => {
    let sendEvent;

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
              newHash: '0x0',
            },
          );
          expect(res).not.toBeNull();
        });

      sendEvent.emit('transactionHash', '0x0');
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
              transaction,
              newHash: '0x0',
            },
          );
          expect(res).not.toBeNull();
        });

      sendEvent.emit('transactionHash', '0x0');
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
});
