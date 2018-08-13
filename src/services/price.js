import axios from 'axios';
import { fiatPriceAPIUrl, fiatPriceMultiAPIUrl } from '@/config';
import throttledQueue from 'throttled-queue';
import { serviceThrottleTimeout } from '@/config';
let throttle = throttledQueue(3, serviceThrottleTimeout);

export default {
  getPrice(symbol, currencies) {
    let throttlePromice = new Promise((res, rej) => {
      if (symbol === 'ETH-TEST') {
        let resp = {};
        resp[currencies] = 0;
        return res(resp);
      }
      throttle(() => {
        axios
          .get(fiatPriceAPIUrl, {
            params: {
              fsym: symbol,
              tsyms: currencies,
            },
          })
          .then(resp => res(resp.data))
          .catch(e => rej(e));
      });
    });
    return throttlePromice;
  },
  getEthPrice(currencies) {
    return this.getPrice('ETH', currencies);
  },
  getPrices(symbols, currency) {
    let throttlePromice = new Promise((res, rej) => {
      if (currency === 'ETH-TEST') {
        let resp = {};
        symbols.map(symbol => {
          resp[currency] = {
            [symbol]: 0,
          };
        });
        return res(resp);
      }
      throttle(() => {
        axios
          .get(fiatPriceMultiAPIUrl, {
            params: {
              fsyms: symbols,
              tsyms: currency,
            },
          })
          .then(resp => res(resp.data))
          .catch(e => rej(e));
      });
    });
    return throttlePromice;
  },
};
