const appStatus = state => {
  if (!state.web3Connection) {
    return 'failed';
  } else if (state.isSyncing || !state.apiConnection) {
    return 'syncing';
  } else {
    return 'ready';
  }
};
const currentProvider = (state, getters, { web3 }) => web3.web3.currentProvider;
const eth = (state, getters, { web3 }) => web3.web3.eth;

export default {
  appStatus,
  currentProvider,
  eth,
};
