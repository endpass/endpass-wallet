import priceService from '@/services/price'
import { subscribtionsBlockchainInterval } from '@/config'

export default {
  namespaced: true,
	state: {
    web3Connection: true,
    apiConnection: true,
    isSyncing: false,
    blockNumber: null,
    web3ErrorArray: [],
    apiErrorsArray:[],
	},
	mutations: {
    setWeb3ConnectionStatus(state, status) {
      state.web3Connection = status;
    },
    setApiConnectionStatus(state, status) {
      state.apiConnection = status;
    },
    setSyncStatus(state, status) {
      state.isSyncing = status;
    },
    addApiErrorId(state, id) {
      var index = array.indexOf(id);
      if (index === -1) state.apiErrorsArray.push(id);
    },
    removeApiErrorId(state, id) {
      var index = array.indexOf(id);
      if (index !== -1) array.splice(index, 1);
    }
	},
  getters: {
    appStatus(state) {
      if (!state.web3Connection) {
        return {
          status: 'danger',
          message: 'Network not responding'
        }
      } else if (!state.apiResponce) {
        return {
          status: 'warning',
          message: 'Synching'
        }
      } else {
        return {
          status: 'success',
          message: 'Synched'
        }
      }
    }
  },
  actions: {
    updateApiErrorStatus({ commit, state }, id, status) {
      if(status) {
        commit('addApiErrorId', id);
        commit('setApiConnectionStatus', status)
      } else {
        commit('removeApiErrorId', id);
        if(state.apiErrorsArray.length === 0) {
          commit('setApiConnectionStatus', status)
        }
      }
    },
    subscribeOnSyncStatus({ state, rootState, commit, dispatch }) {
      const providerCache = rootState.web3.web3.currentProvider;
      return rootState.web3.web3.eth.isSyncing().then(resp => {
        if (providerCache === rootState.web3.web3.currentProvider) {
          commit('setSyncStatus', resp);
          setTimeout(() => {
            dispatch('subscribeOnSyncStatus');
          }, subscribtionsBlockchainInterval);
        } else {
          dispatch('subscribeOnSyncStatus');
        }
      });
    },
    init({ commit, dispatch, state }) {
      return dispatch('subscribeOnSyncStatus');
    }
  }
}
