import web3 from '@/utils/web3';

import {
  CHANGE_NETWORK,
  CHANGE_CURRENCY,
  SET_NETWORKS,
  SET_BLOCK_NUMBER,
  SET_INTERVAL,
} from './mutations-types';

import { providerFactory } from '@/class';

const changeNetwork = (state, network) => {
  const provider = providerFactory(network.url);

  state.activeNet = network;

  // The DebounceProvider instance needs to be destroyed
  if (web3.currentProvider && web3.currentProvider.destroy) {
    web3.currentProvider.destroy();
  }

  web3.setProvider(provider);
};

const changeCurrency = (state, currency) => {
  state.activeCurrency = currency;
};

const setBlockNumber = (state, number) => {
  state.blockNumber = number;
};

const setNetworks = (state, networks) => {
  state.storedNetworks = networks;
};

const setInterval = (state, interval) => {
  state.interval = interval;
};

export default {
  [CHANGE_NETWORK]: changeNetwork,
  [CHANGE_CURRENCY]: changeCurrency,
  [SET_NETWORKS]: setNetworks,
  [SET_BLOCK_NUMBER]: setBlockNumber,
  [SET_INTERVAL]: setInterval,
};
