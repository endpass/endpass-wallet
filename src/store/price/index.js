import getters from './getters';
import mutations from './mutations';
import actions from './actions';

const state = {
  price: null, // Current currency price - null if not fetched
  updateTime: null, // last time of price update
  isLoading: false, // is updating now
  intervalId: null, // interval id of setInterval for price updates
};

export default {
  namespaced: true,
  state,
  actions,
  getters,
  mutations,
};
