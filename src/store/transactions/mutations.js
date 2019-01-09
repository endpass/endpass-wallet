import { Transaction } from '@/class';
import {
  ADD_TRANSACTION,
  SET_TRANSACTION_HISTORY,
  UPDATE_TRANSACTION,
} from './mutations-types';

const addTransaction = (state, transaction) => {
  state.pendingTransactions.push(transaction);
};

const updateTransaction = (state, { hash, payload }) => {
  const trxIndex = state.pendingTransactions.findIndex(
    trx => trx.hash === hash,
  );

  if (trxIndex === -1) {
    console.warn('Transaction not found, is it normal?');
    return;
  }

  const trx = state.pendingTransactions[trxIndex];
  state.pendingTransactions[trxIndex] = Transaction.applyProps(trx, payload);
};

const setTransactionHistory = (state, transactions) => {
  state.transactionHistory = transactions || [];
};

export default {
  [ADD_TRANSACTION]: addTransaction,
  [UPDATE_TRANSACTION]: updateTransaction,
  [SET_TRANSACTION_HISTORY]: setTransactionHistory,
};
