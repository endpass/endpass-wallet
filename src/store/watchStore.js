export default function(store) {
  // Dispatch on change in block number
  // This triggers when a new block is found OR network provider is changed
  store.watch(
    state => state.web3.blockNumber,
    () =>
      Promise.all([
        store.dispatch('accounts/updateBalance'),
        store.dispatch('transactions/getPendingTransactions'),
      ]),
  );
}
