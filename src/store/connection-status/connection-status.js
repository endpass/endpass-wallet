import { subscriptionsBlockchainInterval } from '@/config';

export default {
  namespaced: true,
  state: {
    web3Connection: true,
    apiConnection: true,
    isSyncing: true,
    blockNumber: null,
    apiErrorsArray: [],
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
      var index = state.apiErrorsArray.indexOf(id);
      if (index === -1) state.apiErrorsArray.push(id);
    },
    removeApiErrorId(state, id) {
      var index = state.apiErrorsArray.indexOf(id);
      if (index !== -1) state.apiErrorsArray.splice(index, 1);
    },
  },
  getters: {
    appStatus(state) {
      if (!state.web3Connection) {
        return 'danger';
      } else if (state.isSyncing) {
        return 'warning';
      } else if (!state.apiConnection) {
        return 'warning';
      } else {
        return 'success';
      }
    },
  },
  actions: {
    updateApiErrorStatus({ commit, state }, { id, status }) {
      if (status) {
        commit('addApiErrorId', id);
        commit('setApiConnectionStatus', status);
      } else {
        commit('removeApiErrorId', id);
        if (state.apiErrorsArray.length === 0) {
          commit('setApiConnectionStatus', status);
        }
      }
    },
    subscribeOnSyncStatus({ state, rootState, commit, dispatch }) {
      const providerCache = rootState.web3.web3.currentProvider;
      return rootState.web3.web3.eth
        .isSyncing()
        .then(resp => {
          if (providerCache === rootState.web3.web3.currentProvider) {
            commit('setSyncStatus', resp);
            commit('setWeb3ConnectionStatus', true);
            setTimeout(() => {
              dispatch('subscribeOnSyncStatus');
            }, subscriptionsBlockchainInterval);
          } else {
            dispatch('subscribeOnSyncStatus');
          }
        })
        .catch(e => {
          commit('setWeb3ConnectionStatus', false);
          dispatch('errors/emitError', e, { root: true });
          setTimeout(() => {
            dispatch('subscribeOnSyncStatus');
          }, subscriptionsBlockchainInterval);
        });
    },
    init({ commit, dispatch, state }) {
      return dispatch('subscribeOnSyncStatus');
    },
  },
};
