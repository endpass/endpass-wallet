import MockAdapter from 'axios-mock-adapter';
import { gasPrice } from 'fixtures/gasPrice';
import { price, priceMulti } from 'fixtures/price';
import { address } from 'fixtures/accounts';
import { cryptoDataValidator } from '@/schema';
import { NotificationError, http } from '@/class';

const cryptoDataService = require.requireActual('@/services/cryptoData')
  .default;

describe('Crypto data service', () => {
  const axiosMock = new MockAdapter(http);

  afterEach(() => {
    axiosMock.reset();
  });

  describe('getGasPrice', () => {
    const networkId = 1;
    const requestUrl = `${ENV.VUE_APP_CRYPTODATA_API_URL}/${networkId}/gas/price`;
    const expectedError = new NotificationError({
      title: 'Failed to get suggested gas price',
      text:
        'An error occurred while retrieving suggested gas price. Please, set manually or, try again.',
      type: 'is-warning',
    });

    it('should make correct request', async () => {
      expect.assertions(1);

      axiosMock.onGet(requestUrl).reply(config => {
        expect(config.url).toBe(requestUrl);
        return [200, gasPrice];
      });

      await cryptoDataService.getGasPrice(networkId);
    });

    it('should handle successful GET /gas/price request', () => {
      axiosMock.onGet(requestUrl).reply(200, gasPrice);

      expect(cryptoDataService.getGasPrice(networkId)).resolves.toEqual(
        gasPrice,
      );
    });

    it('should handle data validation errors', async () => {
      expect.assertions(1);

      const gasPriceValidationError = new Error('gasPriceValidationError');

      axiosMock.onGet(requestUrl).reply(200);
      cryptoDataValidator.validateGasPrice.mockImplementationOnce(() => {
        throw gasPriceValidationError;
      });

      await expect(cryptoDataService.getGasPrice(networkId)).rejects.toThrow(
        expectedError,
      );
    });

    it('should handle rejected GET /price request', async () => {
      expect.assertions(1);

      axiosMock.onGet(requestUrl).reply(500);

      await expect(cryptoDataService.getGasPrice(networkId)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('getSymbolsPrices', () => {
    const requestUrl = `${ENV.VUE_APP_CRYPTODATA_API_URL}/price`;
    const fromSymbols = ['ETH', 'BTC'];
    const toSymbol = 'USD';
    const priceMultiResponse = priceMulti;
    const priceResponse = price;

    it('should correctly convert symbols to EHT-TEST', async () => {
      expect.assertions(2);

      const expectedResponse = {
        ETH: {
          'ETH-TEST': 0,
        },
        BTC: {
          'ETH-TEST': 0,
        },
      };

      axiosMock.onGet(requestUrl).reply(200, priceMultiResponse);

      const receivedResponse = await cryptoDataService.getSymbolsPrices(
        fromSymbols,
        'ETH-TEST',
      );

      expect(receivedResponse).toEqual(expectedResponse);
      expect(axiosMock.history.get).toHaveLength(0);
    });

    it('should correctly convert EHT-TEST to symbol', async () => {
      expect.assertions(2);

      const expectedResponse = {
        USD: 0,
      };

      axiosMock.onGet(requestUrl).reply(200, priceMultiResponse);

      const receivedResponse = await cryptoDataService.getSymbolsPrices(
        'ETH-TEST',
        toSymbol,
      );

      expect(receivedResponse).toEqual(expectedResponse);
      expect(axiosMock.history.get).toHaveLength(0);
    });

    it('should make correct request for one symbol', async () => {
      expect.assertions(2);

      axiosMock.onGet(requestUrl).reply(config => {
        expect(config.url).toBe(requestUrl);
        expect(config.params).toEqual({
          from: fromSymbols[0],
          to: toSymbol,
        });
        return [200, priceResponse];
      });

      await cryptoDataService.getSymbolsPrices(fromSymbols[0], toSymbol);
    });

    it('should make correct request for many symbols', async () => {
      expect.assertions(2);

      axiosMock.onGet(requestUrl).reply(config => {
        expect(config.url).toBe(requestUrl);
        expect(config.params).toEqual({
          from: fromSymbols.join(','),
          to: toSymbol,
        });
        return [200, priceMultiResponse];
      });

      await cryptoDataService.getSymbolsPrices(fromSymbols, toSymbol);
    });

    it('should handle successful GET /price request', async () => {
      expect.assertions(1);

      const expectedResponse = {
        ETH: {
          USD: 10,
        },
        BTC: {},
      };

      axiosMock.onGet(requestUrl).reply(200, expectedResponse);

      const response = await cryptoDataService.getSymbolsPrices(
        fromSymbols,
        toSymbol,
      );

      expect(response).toEqual(expectedResponse);
    });

    it('should handle rejected GET /price request', async () => {
      expect.assertions(1);

      axiosMock.onGet(requestUrl).reply(500);

      await expect(
        cryptoDataService.getSymbolsPrices(fromSymbols, toSymbol),
      ).rejects.toThrow(expect.any(Error));
    });

    it('should handle data validation errors', async () => {
      expect.assertions(2);

      const symbolPriceValidationError = new Error(
        'symbolPriceValidationError',
      );
      const symbolsPriceValidationError = new Error(
        'symbolsPriceValidationError',
      );

      axiosMock.onGet(requestUrl).reply(200);
      cryptoDataValidator.validateSymbolsPrices.mockImplementationOnce(() => {
        throw symbolPriceValidationError;
      });
      cryptoDataValidator.validateSymbolsPrices.mockImplementationOnce(() => {
        throw symbolsPriceValidationError;
      });

      await expect(
        cryptoDataService.getSymbolsPrices(fromSymbols[0], toSymbol),
      ).rejects.toThrow(symbolPriceValidationError);

      await expect(
        cryptoDataService.getSymbolsPrices(fromSymbols, toSymbol),
      ).rejects.toThrow(symbolsPriceValidationError);
    });
  });

  describe('getAccountBalance', () => {
    const networkId = 1;
    const requestUrl = `${ENV.VUE_APP_CRYPTODATA_API_URL}/${networkId}/balance/${address}`;
    const tokens = [
      {
        symbol: 'FST',
        price: true,
      },
      {
        symbol: 'SCDT',
        price: true,
      },
    ];
    const tokensPrices = {
      FST: {
        USD: 10,
      },
      SCDT: {
        USD: 0,
      },
    };

    it('should request account balance and tokens with prices', async () => {
      expect.assertions(2);

      axiosMock.onGet(requestUrl).reply(config => {
        expect(config.url).toBe(requestUrl);

        return [
          200,
          {
            balance: 10,
            tokens,
          },
        ];
      });

      cryptoDataService.getSymbolsPrices = jest
        .fn()
        .mockResolvedValueOnce(tokensPrices);

      const res = await cryptoDataService.getAccountBalance({
        network: networkId,
        toSymbol: 'USD',
        address,
      });

      expect(res).toEqual({
        balance: 10,
        tokens: [
          {
            symbol: 'FST',
            price: tokensPrices.FST,
          },
          {
            symbol: 'SCDT',
            price: tokensPrices.SCDT,
          },
        ],
      });
    });

    it('should reject on balance request error', () => {
      axiosMock.onGet(requestUrl).reply(404);

      expect(
        cryptoDataService.getAccountBalance({
          network: networkId,
          toSymbol: 'USD',
          address,
        }),
      ).rejects.toThrow();
    });

    it('should reject on price request error', async () => {
      expect.assertions(1);

      const error = new Error();

      axiosMock.onGet(requestUrl).reply(200, {
        balance: 10,
        tokens,
      });

      cryptoDataService.getSymbolsPrices = jest
        .fn()
        .mockRejectedValueOnce(error);

      expect(
        cryptoDataService.getAccountBalance({
          network: networkId,
          toSymbol: 'USD',
          address,
        }),
      ).rejects.toThrow(error);
    });
  });

  describe('getPendingTransactions', () => {
    const network = 1;
    const address = 'address';
    const filterId = 1;
    const requestUrl = `${ENV.VUE_APP_CRYPTODATA_API_URL}/${network}/transactions/pending`;
    const expectedError = new Error(
      'Failed to get pending transactions. An error occurred while getting pending transactions.',
    );

    it('should make correct request', async () => {
      expect.assertions(2);

      axiosMock.onGet(requestUrl).reply(config => {
        expect(config.url).toBe(requestUrl);
        expect(config.params).toEqual({
          filterId,
          from: address,
        });

        return [200, {}];
      });

      await cryptoDataService.getPendingTransactions(
        network,
        address,
        filterId,
      );
    });

    it('should handle successful GET /transactions/:networkId/pending request', () => {
      const response = {};

      axiosMock.onGet(requestUrl).reply(200, response);

      expect(
        cryptoDataService.getPendingTransactions(network, address, filterId),
      ).resolves.toEqual(response);
    });

    it('should handle data validation errors', async () => {
      expect.assertions(1);

      const pendingTransactionsValidationError = new Error(
        'pendingTransactionsValidationError',
      );

      axiosMock.onGet(requestUrl).reply(200);
      cryptoDataValidator.validatePendingTransactions.mockImplementationOnce(
        () => {
          throw pendingTransactionsValidationError;
        },
      );

      await expect(
        cryptoDataService.getPendingTransactions(network, address, filterId),
      ).rejects.toThrow(expectedError);
    });

    it('should handle rejected GET /transactions/:networkId/pending request', async () => {
      expect.assertions(1);

      axiosMock.onGet(requestUrl).reply(500);

      await expect(
        cryptoDataService.getPendingTransactions(network, address, filterId),
      ).rejects.toThrow(expectedError);
    });
  });
});
