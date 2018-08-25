import { SET_EVENT_EMITTER } from './mutations-types.js';

const setEventEmitter = (state, eventEmitter) => {
  state.errorEmitter = eventEmitter;
};

export default {
  SET_EVENT_EMITTER: setEventEmitter,
};
