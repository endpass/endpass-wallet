import state from '@/store/transactions';
import { SET_TRANSACTION_HISTORY } from '@/store/transactions/mutations-types';

const { mutations } = state;

describe('transactions  mutations', () => {
  let stateInstance;

  beforeEach(() => {
    stateInstance = {
      pendingTransactions: [],
      transactionHistory: [],
    };
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
});
