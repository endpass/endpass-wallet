import mutations from '@/store/dapp/mutations';
import {
  ADD_MESSAGE,
  REMOVE_MESSAGE,
  CHANGE_INJECT_STATUS,
} from '@/store/dapp/mutations-types';

describe('dapp mutations', () => {
  const message = {
    foo: 'bar',
  };
  let state;

  beforeEach(() => {
    state = {
      injected: false,
      messages: {},
      list: [],
    };
  });

  describe('ADD_MESSAGE', () => {
    it('should add message', () => {
      mutations[ADD_MESSAGE](state, { id: 1, message });

      expect(state.messages).toEqual({
        1: message,
      });
      expect(state.list).toEqual([1]);
    });
  });

  describe('REMOVE_MESSAGE', () => {
    beforeEach(() => {
      state = {
        messages: {
          1: message,
        },
        list: [1],
      };
    });

    it('should remove message from store if it exist', () => {
      mutations[REMOVE_MESSAGE](state, 1);

      expect(state.messages).toEqual({});
      expect(state.list).toEqual([]);
    });

    it('should not do anything if message is not exist', () => {
      mutations[REMOVE_MESSAGE](state, 2);

      expect(state.messages).toEqual({
        1: message,
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
