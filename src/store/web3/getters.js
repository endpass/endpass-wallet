import { DEFAULT_NETWORKS } from '@/constants';

const networks = state => {
  const networks = DEFAULT_NETWORKS.concat(state.storedNetworks);

  return state.activeCurrency
    ? networks.filter(net => net.currency === state.activeCurrency.id)
    : networks;
};

const isCustomNetwork = () => network =>
  network.id > 0 &&
  !DEFAULT_NETWORKS.find(defaultNetwork => defaultNetwork.url === network.url);

export default {
  networks,
  isCustomNetwork,
};
