import { web3 } from '@/class';

const appStatus = (state) => {
  if (!state.web3Connection) {
    return 'failed';
  }
  if (state.isSyncing) {
    return 'syncing';
  }
  return 'ready';
};

// FIXME not currently reactive
const currentProvider = () => web3.currentProvider;
const eth = () => web3.eth;

export default {
  appStatus,
  currentProvider,
  eth,
};
