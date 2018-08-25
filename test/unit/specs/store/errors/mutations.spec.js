import mutations from '@/store/errors/mutations';
import { SET_EVENT_EMITTER } from '@/store/errors/mutations-types';

describe('errors mutations', () => {
  const state = {};
  it('should set event emitter', () => {
    let dummyObject = {};
    mutations[SET_EVENT_EMITTER](state, dummyObject);
    expect(state.errorEmitter).toBe(dummyObject);
  });
});
