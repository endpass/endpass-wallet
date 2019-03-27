import state from '@/store/transactions';
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTION,
  SET_TRANSACTION_HISTORY,
  SET_PENDING_TRANSACTIONS_FILTER_ID,
} from '@/store/transactions/mutations-types';
import { ethplorerTransactions } from 'fixtures/transactions';

const { mutations } = state;

describe('transactions  mutations', () => {
  let stateInstance;

  beforeEach(() => {
    stateInstance = {
      pendingTransactions: [],
      transactionHistory: [],
    };
  });

  describe('ADD_TRANSACTION', () => {
    it('should add transaction to pending transactions', () => {
      const [tx] = ethplorerTransactions;

      mutations[ADD_TRANSACTION](stateInstance, tx);

      expect(stateInstance.pendingTransactions).toEqual([tx]);
    });
  });

  describe('UPDATE_TRANSACTION', () => {
    it('should update transaction with given data', () => {
      const [tx] = ethplorerTransactions;

      stateInstance.pendingTransactions = [tx];
      mutations[UPDATE_TRANSACTION](stateInstance, {
        hash: tx.hash,
        payload: {
          success: false,
        },
      });

      expect(stateInstance.pendingTransactions).toEqual([
        {
          ...tx,
          success: false,
        },
      ]);
    });
  });

  describe('SET_TRANSACTION_HISTORY', () => {
    it('should set transaction history', () => {
      mutations[SET_TRANSACTION_HISTORY](stateInstance, [{}, {}]);

      expect(stateInstance.transactionHistory).toHaveLength(2);
    });

    it('should set an empty array with the nullable parameter', () => {
      mutations[SET_TRANSACTION_HISTORY](stateInstance, null);

      expect(stateInstance.transactionHistory).toEqual([]);
    });
  });

  describe('SET_PENDING_TRANSACTIONS_FILTER_ID', () => {
    it('should set pendingTransactionsFilterId', () => {
      const newFilterId = 1;

      mutations[SET_PENDING_TRANSACTIONS_FILTER_ID](stateInstance, newFilterId);

      expect(stateInstance.pendingTransactionsFilterId).toBe(newFilterId);
    });
  });
});
