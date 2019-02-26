import {
  CHANGE_NETWORK,
  CHANGE_CURRENCY,
  SET_NETWORKS,
  SET_BLOCK_NUMBER,
  SET_HANDLED_BLOCK_NUMBER,
} from './mutations-types';

const changeNetwork = (state, network) => {
  state.activeNet = network;
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
