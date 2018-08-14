import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

jest.mock('throttled-queue', function() {
  return function() {
    return function(callback) {
      callback();
    };
  };
});

import {
  fiatPriceAPIUrl,
  fiatPriceMultiAPIUrl,
  serviceThrottleTimeout,
} from '@/config';
import priceService from '@/services/price';

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
    it('should make correct request', done => {
      const symbol = 'ETH',
        currencies = ['KEK', 'CHPOK'];
      priceService.getPrice(symbol, currencies);
      mock.onGet(fiatPriceAPIUrl).reply(config => {
        setTimeout(() => {
          expect(config.method).toBe('get');
          expect(config.url).toBe(fiatPriceAPIUrl);
          expect(config.params).toEqual({
            fsym: symbol,
            tsyms: currencies,
          });
          done();
        }, serviceThrottleTimeout);
        return [200, {}];
      });
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

    it('should make correct request', done => {
      const symbol = 'ETH',
        currencies = ['KEK', 'CHPOK'];
      priceService.getPrices(symbol, currencies);
      mock.onGet(fiatPriceMultiAPIUrl).reply(config => {
        setTimeout(() => {
          expect(config.method).toBe('get');
          expect(config.url).toBe(fiatPriceMultiAPIUrl);
          expect(config.params).toEqual({
            fsyms: symbol,
            tsyms: currencies,
          });
          done();
        }, serviceThrottleTimeout);
        return [200, {}];
      });
    });
  });
});
