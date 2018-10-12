import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
const priceService = require.requireActual('@/services/price').default;

jest.mock('throttled-queue', function() {
  return function() {
    return function(callback) {
      callback();
    };
  };
});

describe('Price service', () => {
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  describe('get price', () => {
    //it("shouldn't call api with ETH-TEST", async () => {
    //  const symbol = 'ETH-TEST';
    //  const watcher = jest.fn();
    //  priceService.getPrice(symbol);
    //  moxios.wait(() => {
    //    const request = moxios.requests.mostRecent();
    //    expect(request).toBe(undefined);
    //    done();
    //  });
    //});
    it('should make correct request', async () => {
      const symbol = 'ETH',
        currencies = ['KEK', 'CHPOK'];
      expect.assertions(3);
      mock.onGet(env.fiatPriceAPIUrl).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(env.fiatPriceAPIUrl);
        expect(config.params).toEqual({
          fsym: symbol,
          tsyms: currencies,
        });
        return [200, {}];
      });
      await priceService.getPrice(symbol, currencies);
    });
  });

  describe('get prices', () => {
    //it("shouldn't call api with ETH-TEST", done => {
    //  const symbol = 'ETH-TEST',
    //    currencies = ['KEK', 'CHPOK'];
    //  priceService.getPrices(currencies, symbol);
    //  moxios.wait(() => {
    //    const request = moxios.requests.mostRecent();
    //    expect(request).toBe(undefined);
    //    done();
    //  });
    //});

    it('should make correct request', async () => {
      const symbol = 'ETH',
        currencies = ['KEK', 'CHPOK'];
      expect.assertions(3);
      mock.onGet(env.fiatPriceMultiAPIUrl).reply(config => {
        expect(config.method).toBe('get');
        expect(config.url).toBe(env.fiatPriceMultiAPIUrl);
        expect(config.params).toEqual({
          fsyms: symbol,
          tsyms: currencies,
        });
        return [200, {}];
      });

      await priceService.getPrices(symbol, currencies);
    });
  });
});
