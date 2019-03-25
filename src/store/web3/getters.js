import { Network } from '@endpass/class';

const networks = (state) => {
  const networksList = [
    ...Object.values(Network.DEFAULT_NETWORKS),
    ...state.storedNetworks,
  ];

  return state.activeCurrency
    ? networksList.filter(net => net.currency === state.activeCurrency.id)
    : networksList;
};

const isCustomNetwork = () => network => network.id > 0
  && !Object.values(Network.DEFAULT_NETWORKS).find(
    defaultNetwork => defaultNetwork.url === network.url,
  );

const activeNetwork = state => state.activeNet.id;

export default {
  networks,
  isCustomNetwork,
  activeNetwork,
};
