import web3 from '@/utils/web3';

const appStatus = state => {
  if (!state.web3Connection) {
    return 'failed';
  } else if (state.isSyncing || !state.apiConnection) {
    return 'syncing';
  } else {
    return 'ready';
  }
};

// FIXME not currently reactive
const currentProvider = () => web3.currentProvider;
const eth = () => web3.eth;

export default {
  appStatus,
  currentProvider,
  eth,
};
