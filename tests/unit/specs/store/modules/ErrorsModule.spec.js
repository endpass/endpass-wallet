import ModuleRegister from '@/store/class/ModuleRegister';
import createStore from '@/store/createStore';

import ErrorsModule from '@/store/modules/ErrorsModule';
import ConnectionStatusModule from '@/store/modules/ConnectionStatusModule';

describe('ErrorsModule', () => {
  let store;
  let moduleRegister;
  let errorsModule;
  let connectionStatus;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore();
    moduleRegister = new ModuleRegister(store);
    connectionStatus = moduleRegister.registerModule(
      'connectionStatus',
      ConnectionStatusModule,
    );

    errorsModule = moduleRegister.registerModule('errors', ErrorsModule);
  });

  describe('emitError', () => {
    it('should emit error', () => {
      const err = { kek: 'kek' };
      const mock = jest.fn();

      errorsModule.errorEmitter.once('error', mock);

      errorsModule.emitError(err);

      expect(mock).toHaveBeenCalledWith(err);
      expect(connectionStatus.apiErrorsArray).toHaveLength(0);
    });

    it('should call update api', () => {
      const apiError = {
        id: 'id',
        status: true,
      };
      const mock = jest.fn();

      errorsModule.errorEmitter.once('error', mock);

      errorsModule.emitError({
        apiError,
      });

      expect(mock).toHaveBeenCalledWith({ apiError });
      expect(connectionStatus.apiErrorsArray).toHaveLength(1);
    });
  });
});
