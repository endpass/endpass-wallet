import web3 from '@/class/singleton/web3';

import {
  CHANGE_NETWORK,
  CHANGE_CURRENCY,
  SET_NETWORKS,
  SET_BLOCK_NUMBER,
  SET_HANDLED_BLOCK_NUMBER,
  SET_INTERVAL,
} from './mutations-types';

import { ProviderFactory } from '@/class';

const changeNetwork = (state, network) => {
  state.activeNet = network;
  web3.setProvider(ProviderFactory.create(network.url));
};

const changeCurrency = (state, currency) => {
  state.activeCurrency = currency;
};

const setBlockNumber = (state, number) => {
  state.blockNumber = number;
};

const setHandledBlockNumber = (state, number) => {
  state.handledBlockNumber = number;
};

const setNetworks = (state, networks) => {
  state.storedNetworks = networks;
};

export default {
  [CHANGE_NETWORK]: changeNetwork,
  [CHANGE_CURRENCY]: changeCurrency,
  [SET_NETWORKS]: setNetworks,
  [SET_BLOCK_NUMBER]: setBlockNumber,
  [SET_HANDLED_BLOCK_NUMBER]: setHandledBlockNumber,
};
