import { Transaction } from '@/class';
import {
  ADD_TRANSACTION,
  SET_TRANSACTION_HISTORY,
  UPDATE_TRANSACTION,
  SET_PENDING_TRANSACTIONS_FILTER_ID,
} from './mutations-types';

const addTransaction = (state, transaction) => {
  state.pendingTransactions.push(transaction);
};

const updateTransaction = (state, { hash, payload }) => {
  const trxIndex = state.pendingTransactions.findIndex(
    trx => trx.hash === hash,
  );

  if (trxIndex === -1) {
    /* eslint-disable-next-line no-console */
    console.warn('Transaction not found, is it normal?', hash);
    return;
  }

  const trx = state.pendingTransactions[trxIndex];
  state.pendingTransactions[trxIndex] = Transaction.applyProps(trx, payload);
  state.pendingTransactions = [...state.pendingTransactions];
};

const setTransactionHistory = (state, transactions) => {
  state.transactionHistory = transactions || [];
};

const setPendingTransactionsFilterId = (state, filterId) => {
  state.pendingTransactionsFilterId = filterId;
};

export default {
  [ADD_TRANSACTION]: addTransaction,
  [UPDATE_TRANSACTION]: updateTransaction,
  [SET_TRANSACTION_HISTORY]: setTransactionHistory,
  [SET_PENDING_TRANSACTIONS_FILTER_ID]: setPendingTransactionsFilterId,
};
