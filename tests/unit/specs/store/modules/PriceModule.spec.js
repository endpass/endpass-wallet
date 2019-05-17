import ModuleRegister from '@/store/class/ModuleRegister';
import createStore from '@/store/createStore';

import ErrorsModule from '@/store/modules/ErrorsModule';
import ConnectionStatusModule from '@/store/modules/ConnectionStatusModule';
import PriceModule from '@/store/modules/PriceModule';
import { Network } from '@endpass/class';
import cryptoDataService from '@/services/cryptoData';

describe('PriceModule', () => {
  let store;
  let moduleRegister;
  let errors;
  let connectionStatus;
  let price;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    store = createStore({
      web3: {
        activeCurrency: Network.CURRENCIES[0],
      },
      user: {
        settings: { fiatCurrency: 'USD' },
      },
    });

    moduleRegister = new ModuleRegister(store);

    const modules = moduleRegister.registerModules({
      errors: ErrorsModule,
      connectionStatus: ConnectionStatusModule,
      price: PriceModule,
    });

    ({ errors, price, connectionStatus } = modules);
  });

  describe('initial', () => {
    it('should be initial state', () => {
      expect(price.isLoading).toBe(false);
      expect(price.price).toBe(null);
    });
  });

  describe('updatePrice', () => {
    it('should set price', async () => {
      expect.assertions(2);

      await price.updatePrice();

      expect(price.price).toBe(10);
      expect(connectionStatus.apiErrorsArray).toEqual(['price']);
    });

    it('should process fail and set new price value on next timeout', async () => {
      expect.assertions(5);

      cryptoDataService.getSymbolsPrices.mockRejectedValueOnce({});

      const mock = jest.fn();

      errors.errorEmitter.once('error', mock);

      await price.updatePrice();

      expect(price.price).toBe(null);
      expect(mock).toBeCalledWith({
        apiError: {
          id: 'price',
          status: false,
        },
      });
      expect(connectionStatus.apiErrorsArray).toEqual([]);

      jest.runOnlyPendingTimers();
      await global.flushPromises();

      expect(price.price).toBe(10);
      expect(connectionStatus.apiErrorsArray).toEqual(['price']);
    });

    it('should update isLoading', async () => {
      expect.assertions(3);

      expect(price.isLoading).toBe(false);

      price.updatePrice();

      expect(price.isLoading).toBe(true);

      await global.flushPromises();

      expect(price.isLoading).toBe(false);
    });
  });
});
