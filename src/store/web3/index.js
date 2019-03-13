import { Network } from '@endpass/class';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  storedNetworks: [],
  blockNumber: null,
  handledBlockNumber: null,
  activeNet: {},
  interval: null,
  activeCurrency: Network.CURRENCIES[0],
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
