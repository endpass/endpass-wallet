import { EventEmitter } from '@/class';
import actions from './actions';

const state = {
  errorEmitter: new EventEmitter(),
};

export default {
  namespaced: true,
  state,
  actions,
};
