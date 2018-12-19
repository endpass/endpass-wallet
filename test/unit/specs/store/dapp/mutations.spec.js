import mutations from '@/store/dapp/mutations';
import {
  ADD_REQUEST,
  REMOVE_REQUEST,
  CHANGE_INJECT_STATUS,
} from '@/store/dapp/mutations-types';

describe('dapp mutations', () => {
  const request = {
    foo: 'bar',
  };
  let state;

  beforeEach(() => {
    state = {
      injected: false,
      requests: {},
      list: [],
    };
  });

  describe('ADD_REQUEST', () => {
    it('should add request', () => {
      mutations[ADD_REQUEST](state, { id: 1, request });

      expect(state.requests).toEqual({
        1: request,
      });
      expect(state.list).toEqual([1]);
    });
  });

  describe('REMOVE_REQUEST', () => {
    beforeEach(() => {
      state = {
        requests: {
          1: request,
        },
        list: [1],
      };
    });

    it('should remove request from store if it exist', () => {
      mutations[REMOVE_REQUEST](state, 1);

      expect(state.requests).toEqual({});
      expect(state.list).toEqual([]);
    });

    it('should not do anything if request is not exist', () => {
      mutations[REMOVE_REQUEST](state, 2);

      expect(state.requests).toEqual({
        1: request,
      });
      expect(state.list).toEqual([1]);
    });
  });

  describe('CHANGE_INJECT_STATUS', () => {
    it('should change inject status', () => {
      mutations[CHANGE_INJECT_STATUS](state, true);

      expect(state.injected).toBe(true);

      mutations[CHANGE_INJECT_STATUS](state, false);

      expect(state.injected).toBe(false);
    });
  });
});
