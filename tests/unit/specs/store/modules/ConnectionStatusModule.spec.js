import ModuleRegister from '@/store/class/ModuleRegister';
import createStore from '@/store/createStore';

import ErrorsModule from '@/store/modules/ErrorsModule';
import ConnectionStatusModule from '@/store/modules/ConnectionStatusModule';
import { web3 } from '@/class';

describe('ConnectionStatusModule', () => {
  let store;
  let moduleRegister;
  let errorsModule;
  let connectionStatus;

  beforeAll(() => {
    jest.useFakeTimers();
  });

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

  describe('api status and errors', () => {
    const apiError = {
      id: 'id',
      status: true,
    };

    it('should initial state correct', () => {
      expect(connectionStatus.isApiConnecting).toBe(true);
      expect(connectionStatus.isWeb3Connecting).toBe(true);
      expect(connectionStatus.isSyncing).toBe(true);
      expect(connectionStatus.apiErrorsArray).toEqual([]);
      expect(connectionStatus.appStatus).toBe('syncing');
    });

    it('should update api connection status by error', () => {
      errorsModule.emitError({ apiError });

      expect(connectionStatus.isApiConnecting).toBe(true);
      expect(connectionStatus.apiErrorsArray).toEqual(['id']);

      errorsModule.emitError({
        apiError: {
          ...apiError,
          status: false,
        },
      });

      expect(connectionStatus.isApiConnecting).toBe(false);
      expect(connectionStatus.apiErrorsArray).toEqual([]);
    });

    it('should not change status if error left', () => {
      errorsModule.emitError({ apiError });
      errorsModule.emitError({
        apiError: {
          ...apiError,
          id: 'second',
        },
      });

      expect(connectionStatus.isApiConnecting).toBe(true);
      expect(connectionStatus.apiErrorsArray).toEqual(['id', 'second']);

      errorsModule.emitError({
        apiError: {
          ...apiError,
          status: false,
        },
      });

      expect(connectionStatus.isApiConnecting).toBe(true);
      expect(connectionStatus.apiErrorsArray).toEqual(['second']);
    });
  });

  describe('syncStatus', () => {
    it('should set ready status', async () => {
      expect.assertions(3);

      await connectionStatus.pingSyncStatus();

      expect(connectionStatus.isSyncing).toBe(false);
      expect(connectionStatus.isWeb3Connecting).toBe(true);
      expect(connectionStatus.appStatus).toBe('ready');
    });

    it('should syncing status if wrong provider', async () => {
      expect.assertions(4);

      expect(connectionStatus.isSyncing).toBe(true);

      const cache = web3.currentProvider;
      web3.currentProvider = NaN; // hack for equality

      await connectionStatus.pingSyncStatus();

      web3.currentProvider = cache;
      expect(connectionStatus.isSyncing).toBe(true);
      expect(connectionStatus.isWeb3Connecting).toBe(true);
      expect(connectionStatus.appStatus).toBe('syncing');
    });

    it('should set fail status and add error', async () => {
      expect.assertions(6);

      web3.eth.isSyncing.mockRejectedValueOnce({
        apiError: {
          id: 'id',
          status: true,
        },
      });

      expect(connectionStatus.apiErrorsArray).toEqual([]);

      await connectionStatus.pingSyncStatus();

      expect(connectionStatus.isSyncing).toBe(true);
      expect(connectionStatus.isWeb3Connecting).toBe(false);
      expect(connectionStatus.appStatus).toBe('failed');
      expect(connectionStatus.apiErrorsArray).toEqual(['id']);
      expect(connectionStatus.isApiConnecting).toBe(true);
    });
  });

  describe('init', () => {
    it('should correct call init', async () => {
      expect.assertions(5);

      connectionStatus.init();

      await global.flushPromises();

      expect(connectionStatus.isApiConnecting).toBe(true);
      expect(connectionStatus.isWeb3Connecting).toBe(true);
      expect(connectionStatus.isSyncing).toBe(false);
      expect(connectionStatus.apiErrorsArray).toEqual([]);
      expect(connectionStatus.appStatus).toBe('ready');
    });
  });
});
