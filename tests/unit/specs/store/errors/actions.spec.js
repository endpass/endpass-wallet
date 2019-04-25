import actions from '@/store/errors/actions';

describe('errors store actions', () => {
  const state = {
    errorEmitter: {
      emit: jest.fn(),
    },
  };
  const dispatch = jest.fn();

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
});
