import MockAdapter from 'axios-mock-adapter';

import { http } from '@/class/singleton';
const priceService = require.requireActual('@/services/price').default;

jest.mock('throttled-queue', function() {
  return function() {
    return function(callback) {
      callback();
    };
  };
});

describe('Price service', () => {
  const axiosMock = new MockAdapter(http);
  const requestUrl = `${ENV.cryptoDataAPIUrl}/price`;
  const fromSymbols = ['ETH', 'BTC'];
  const toSymbol = 'USD';
  const response = {};

  afterEach(() => {
    axiosMock.reset();
  });

  describe('getEthPrice', () => {
    it('should call getPrices method', () => {
      jest.spyOn(priceService, 'getPrices');
      priceService.getPrices.mockReturnValue(response);

      const receiveResponse = priceService.getEthPrice(toSymbol);

      expect(priceService.getPrices).toHaveBeenCalledTimes(1);
      expect(priceService.getPrices).toHaveBeenCalledWith('ETH', toSymbol);
      expect(receiveResponse).toEqual(response);

      priceService.getPrices.mockRestore();
    });
  });

  describe('getPrices', () => {
    it('should correctly convert symbols to EHT-TEST', async () => {
      const toSymbol = 'ETH-TEST';
      const expectedResponse = {
        ETH: { [toSymbol]: 0 },
        BTC: { [toSymbol]: 0 },
      };

      const receivedResponse = await priceService.getPrices(
        fromSymbols,
        toSymbol,
      );

      expect(receivedResponse).toEqual(expectedResponse);
      expect(axiosMock.history.get).toHaveLength(0);
    });

    it('should correctly convert EHT-TEST to symbol', async () => {
      const fromSymbols = 'ETH-TEST';
      const expectedResponse = { [toSymbol]: 0 };

      const receivedResponse = await priceService.getPrices(
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
        return [200, response];
      });

      await priceService.getPrices(fromSymbols[0], toSymbol);
    });

    it('should make correct request for many symbols', async () => {
      expect.assertions(2);

      axiosMock.onGet(requestUrl).reply(config => {
        expect(config.url).toBe(requestUrl);
        expect(config.params).toEqual({
          from: fromSymbols.join(','),
          to: toSymbol,
        });
        return [200, response];
      });

      await priceService.getPrices(fromSymbols, toSymbol);
    });

    it('should handle successful GET /price request', async () => {
      expect.assertions(1);

      axiosMock.onGet(requestUrl).reply(200, response);

      const response = await priceService.getPrices(fromSymbols, toSymbol);

      expect(response).toEqual(response);
    });

    it('should handle rejected GET /price request', async () => {
      expect.assertions(1);

      axiosMock.onGet(requestUrl).reply(500);

      await expect(
        priceService.getPrices(fromSymbols, toSymbol),
      ).rejects.toThrow(expect.any(Error));
    });
  });
});
