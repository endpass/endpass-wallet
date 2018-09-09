import web3 from '@/utils/web3';

import * as mutationsTypes from './mutations-types';
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

const addNetwork = (state, network) => {
  state.storedNetworks.push(network);
};

const updateNetwork = (state, network) => {
  const storedNetwork = state.storedNetworks.find(
    item => item.id === network.id,
  );

  if (storedNetwork) {
    storedNetwork.name = network.name;
    storedNetwork.url = network.url;
    storedNetwork.currency = network.currency;
  }
};

const deleteNetwork = (state, network) => {
  state.storedNetworks = state.storedNetworks.filter(
    item => item.id !== network.id,
  );
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
  [mutationsTypes.CHANGE_NETWORK]: changeNetwork,
  [mutationsTypes.CHANGE_CURRENCY]: changeCurrency,
  [mutationsTypes.ADD_NETWORK]: addNetwork,
  [mutationsTypes.UPDATE_NETWORK]: updateNetwork,
  [mutationsTypes.DELETE_NETWORK]: deleteNetwork,
  [mutationsTypes.SET_NETWORKS]: setNetworks,
  [mutationsTypes.SET_BLOCK_NUMBER]: setBlockNumber,
  [mutationsTypes.SET_INTERVAL]: setInterval,
};
