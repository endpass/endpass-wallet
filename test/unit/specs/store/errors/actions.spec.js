import actions from '@/store/errors/actions';
import { EventEmitter } from '@/class';
import { SET_EVENT_EMITTER } from '@/store/errors/mutations-types';

describe('errors store actions', () => {
  let state = {
    errorEmitter: {
      emit: jest.fn(),
    },
  };
  let dispatch = jest.fn();
  let commit = jest.fn();
  describe('emitError', () => {
    it('should emit error', () => {
      const err = {};
      actions.emitError({ state }, err);
      expect(state.errorEmitter.emit).toHaveBeenCalledWith('error', err);
    });

    it('should update api', () => {
      const err = {
        apiError: {},
      };
      actions.emitError({ state, dispatch }, err);
      expect(dispatch).toHaveBeenCalledWith(
        'connectionStatus/updateApiErrorStatus',
        err.apiError,
        {
          root: true,
        },
      );
    });
  });

  describe('init', () => {
    it('should set eventEmitter', () => {
      actions.init({ commit });
      expect(commit).toHaveBeenCalledWith(
        SET_EVENT_EMITTER,
        expect.any(EventEmitter),
      );
    });
  });
});
