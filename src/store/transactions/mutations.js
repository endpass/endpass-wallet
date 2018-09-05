const addTransaction = (state, transaction) => {
  state.pendingTransactions.push(transaction);
};

const updateTransaction = (state, { hash, payload }) => {
  const trxIndex = state.pendingTransactions.findIndex(
    trx => trx.hash === hash,
  );

  Object.assign(state.pendingTransactions[trxIndex], payload);
};

const setTransactionHistory = (state, transactions) => {
  state.transactionHistory = transactions || [];
};

export default {
  addTransaction,
  updateTransaction,
  setTransactionHistory,
};
