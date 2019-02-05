import MockAdapter from 'axios-mock-adapter';

import { NotificationError, http } from '@/class';
import { cryptoDataValidator } from '@/schema';
import { gasPrice } from 'fixtures/gasPrice';
import { price, priceMulti } from 'fixtures/price';

const cryptoDataService = require.requireActual('@/services/cryptoData')
  .default;

describe('Crypto data service', () => {
  const axiosMock = new MockAdapter(http);

  afterEach(() => {
    axiosMock.reset();
  });

  describe('getSymbolsPrice', () => {
    const requestUrl = `${ENV.cryptoDataAPIUrl}/price`;
    const fromSymbols = ['ETH', 'BTC'];
    const toSymbol = 'USD';
    const priceMultiResponse = priceMulti;
    const priceResponse = price;

    it('should correctly convert symbols to EHT-TEST', async () => {
      expect.assertions(2);

      const toSymbol = 'ETH-TEST';
      const expectedResponse = {
        ETH: { [toSymbol]: 0 },
        BTC: { [toSymbol]: 0 },
      };

      axiosMock.onGet(requestUrl).reply(200, priceMultiResponse);

      const receivedResponse = await cryptoDataService.getSymbolsPrice(
        fromSymbols,
        toSymbol,
      );

      expect(receivedResponse).toEqual(expectedResponse);
      expect(axiosMock.history.get).toHaveLength(0);
    });

    it('should correctly convert EHT-TEST to symbol', async () => {
      expect.assertions(2);

      const fromSymbols = 'ETH-TEST';
      const expectedResponse = { [toSymbol]: 0 };

      axiosMock.onGet(requestUrl).reply(200, priceMultiResponse);

      const receivedResponse = await cryptoDataService.getSymbolsPrice(
        fromSymbols,
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

      await cryptoDataService.getSymbolsPrice(fromSymbols[0], toSymbol);
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

      await cryptoDataService.getSymbolsPrice(fromSymbols, toSymbol);
    });

    it('should handle successful GET /price request', async () => {
      expect.assertions(1);

      axiosMock.onGet(requestUrl).reply(200, priceMultiResponse);

      const response = await cryptoDataService.getSymbolsPrice(
        fromSymbols,
        toSymbol,
      );

      expect(response).toEqual(priceMultiResponse);
    });

    it('should handle rejected GET /price request', async () => {
      expect.assertions(1);

      axiosMock.onGet(requestUrl).reply(500);

      await expect(
        cryptoDataService.getSymbolsPrice(fromSymbols, toSymbol),
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
      cryptoDataValidator.validateSymbolsPrice.mockImplementationOnce(() => {
        throw symbolPriceValidationError;
      });
      cryptoDataValidator.validateSymbolsPrice.mockImplementationOnce(() => {
        throw symbolsPriceValidationError;
      });

      await expect(
        cryptoDataService.getSymbolsPrice(fromSymbols[0], toSymbol),
      ).rejects.toThrow(symbolPriceValidationError);

      await expect(
        cryptoDataService.getSymbolsPrice(fromSymbols, toSymbol),
      ).rejects.toThrow(symbolsPriceValidationError);
    });
  });

  describe('getGasPrice', () => {
    const network = 1;
    const requestUrl = `${ENV.cryptoDataAPIUrl}/${network}/gas/price`;
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

      await cryptoDataService.getGasPrice(network);
    });

    it('should handle successful GET /gas/price request', () => {
      axiosMock.onGet(requestUrl).reply(200, gasPrice);

      expect(cryptoDataService.getGasPrice(network)).resolves.toEqual(gasPrice);
    });

    it('should handle data validation errors', async () => {
      expect.assertions(1);

      const gasPriceValidationError = new Error('gasPriceValidationError');

      axiosMock.onGet(requestUrl).reply(200);
      cryptoDataValidator.validateGasPrice.mockImplementationOnce(() => {
        throw gasPriceValidationError;
      });

      await expect(cryptoDataService.getGasPrice(network)).rejects.toThrow(
        expectedError,
      );
    });

    it('should handle rejected GET /gas/price request', async () => {
      expect.assertions(1);

      axiosMock.onGet(requestUrl).reply(500);

      await expect(cryptoDataService.getGasPrice(network)).rejects.toThrow(
        expectedError,
      );
    });
  });

  describe('getPendingTransactions', () => {
    const network = 1;
    const address = 'address';
    const filterId = 1;
    const requestUrl = `${
      ENV.cryptoDataAPIUrl
    }/${network}/transactions/pending`;
    const expectedError = new NotificationError({
      title: 'Failed to get pending transactions',
      text: 'An error occurred while getting pending transactions.',
      type: 'is-warning',
    });

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
