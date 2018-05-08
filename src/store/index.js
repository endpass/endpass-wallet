import Vue from 'vue'
import Vuex from 'vuex'

import accounts from './accounts/accounts'
import tokens from './tokens/tokens'
import web3 from './web3/web3'

Vue.use(Vuex)
export default new Vuex.Store({
    state: {
    },
    mutations: {
    },
    modules: {
      accounts,
      web3,
      tokens
    }
})
