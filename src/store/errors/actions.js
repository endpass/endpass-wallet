const emitError = ({ state, dispatch }, error) => {
  if (error.apiError) {
    dispatch('connectionStatus/updateApiErrorStatus', error.apiError, {
      root: true,
    });
  }
  state.errorEmitter.emit('error', error);
};

export default {
  emitError,
};
