import { EventEmitter } from '../../class';

export default {
  namespaced: true,
  state: {
    errorEmitter: null,
  },
  mutations: {
    setEventEmitter(state, eventEmitter) {
      state.errorEmitter = eventEmitter;
    },
  },
  actions: {
    emitError({ state, dispatch }, error) {
      if (error.apiError) {
        dispatch('connectionStatus/updateApiErrorStatus', error.apiError, {
          root: true,
        });
      }
      state.errorEmitter.emit('error', error);
    },

    init({ commit }) {
      return commit('setEventEmitter', new EventEmitter());
    },
  },
};
