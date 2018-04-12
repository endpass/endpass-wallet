import Vue from 'vue'
import Vuex from 'vuex'

import accounts from './accounts/accounts'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
    },
    mutations: {
    },
    modules: {
      accounts
    }
})
