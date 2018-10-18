import {
  CHANGE_INIT_STATUS,
  ADD_TRANSACTION,
  REMOVE_TRANSACTION,
} from './mutations-types';

const changeInitStatus = (state, status) => {
  state.inited = status;
};

const addTransaction = (state, transaction) => {
  state.queue.push(transaction);
};

const removeTransaction = (state, transaction) => {
  const transactionIdx = state.queue.findIndex(({ id }) => transaction.id);

  if (transactionIdx !== -1) {
    state.queue.splice(transactionIdx, 1);
  }
};

export default {
  [CHANGE_INIT_STATUS]: changeInitStatus,
  [ADD_TRANSACTION]: addTransaction,
  [REMOVE_TRANSACTION]: removeTransaction,
};
