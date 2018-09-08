import { CURRENCIES } from '@/constants';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
  storedNetworks: [],
  blockNumber: 0,
  activeNet: {},
  interval: null,
  activeCurrency: CURRENCIES[0],
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
