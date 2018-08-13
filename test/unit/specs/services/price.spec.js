import moxios from 'moxios';
import axios from 'axios';

import {
  fiatPriceAPIUrl,
  fiatPriceMultiAPIUrl,
  serviceThrottleTimeout,
} from '@/config';
import priceService from '@/services/price';

describe('Price service', () => {
  beforeEach(() => {
    moxios.install(axios);
  });

  afterEach(() => {
    moxios.uninstall(axios);
  });

  describe('get price', () => {
    it("shouldn't call api with ETH-TEST", done => {
      const symbol = 'ETH-TEST';
      const watcher = jest.fn();
      priceService.getPrice(symbol);
      moxios.wait(() => {
        setTimeout(() => {
          const request = moxios.requests.mostRecent();
          expect(request).toBe(undefined);
          done();
        }, serviceThrottleTimeout);
      });
    });
    it('should make correct request', done => {
      const symbol = 'ETH',
        currencies = ['KEK', 'CHPOK'];
      priceService.getPrice(symbol, currencies);
      moxios.wait(() => {
        setTimeout(() => {
          const request = moxios.requests.mostRecent();
          expect(request.config.method).toBe('get');
          expect(request.config.url).toBe(fiatPriceAPIUrl);
          expect(request.config.params).toEqual({
            fsym: symbol,
            tsyms: currencies,
          });
          done();
        }, serviceThrottleTimeout);
      });
    });
  });

  describe('get prices', () => {
    it("shouldn't call api with ETH-TEST", done => {
      const symbol = 'ETH-TEST',
        currencies = ['KEK', 'CHPOK'];
      priceService.getPrices(currencies, symbol);
      moxios.wait(() => {
        setTimeout(() => {
          const request = moxios.requests.mostRecent();
          expect(request).toBe(undefined);
          done();
        }, serviceThrottleTimeout);
      });
    });

    it('should make correct request', done => {
      const symbol = 'ETH',
        currencies = ['KEK', 'CHPOK'];
      priceService.getPrices(symbol, currencies);
      moxios.wait(() => {
        setTimeout(() => {
          const request = moxios.requests.mostRecent();
          expect(request.config.method).toBe('get');
          expect(request.config.url).toBe(fiatPriceMultiAPIUrl);
          expect(request.config.params).toEqual({
            fsyms: symbol,
            tsyms: currencies,
          });
          done();
        }, serviceThrottleTimeout);
      });
    });
  });
});
