import { SET_EVENT_EMITTER } from './mutations-types';

const emitError = ({ state, dispatch }, error) => {
  if (error.apiError) {
    dispatch('connectionStatus/updateApiErrorStatus', error.apiError, {
      root: true,
    });
  }
  state.errorEmitter.emit('error', error);
};

const init = ({ commit }) => {
  return commit(SET_EVENT_EMITTER, new EventEmitter());
};

export default {
  init,
  emitError,
};
