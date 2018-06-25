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
    emitError({ state }, error) {
      state.errorEmitter.emit('error', error);
    },

    init({ commit }) {
      return commit('setEventEmitter', new EventEmitter());
    },
  },
};
