import { DEFAULT_NETWORKS } from '@/constants';

const networks = state => {
  const networksList = DEFAULT_NETWORKS.concat(state.storedNetworks);

  return state.activeCurrency
    ? networksList.filter(net => net.currency === state.activeCurrency.id)
    : networksList;
};

const isCustomNetwork = () => network =>
  network.id > 0 &&
  !DEFAULT_NETWORKS.find(defaultNetwork => defaultNetwork.url === network.url);

const activeNetwork = state => state.activeNet.id;

export default {
  networks,
  isCustomNetwork,
  activeNetwork,
};
