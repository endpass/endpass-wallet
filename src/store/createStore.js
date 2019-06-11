import Vue from 'vue';
import Vuex from 'vuex';

import actions from './core/actions';
import mutations from './core/mutations';

import { web3Plugin } from './plugins';

Vue.use(Vuex);

export default function(state = {}) {
  const store = new Vuex.Store({
    state: {
      isPageLoading: false,
      ...state,
    },
    strict: !ENV.VUE_APP_IS_PRODUCTION,
    mutations,
    actions,
    plugins: [web3Plugin],
  });

  return store;
}
