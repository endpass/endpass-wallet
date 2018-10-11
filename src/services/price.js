import axios from 'axios';
import {
  fiatPriceAPIUrl,
  fiatPriceMultiAPIUrl,
  serviceThrottleTimeout,
} from '@/config';
import throttledQueue from 'throttled-queue';

const throttle = throttledQueue(3, serviceThrottleTimeout);

export default {
  getPrice(symbol, currencies) {
    const throttlePromice = new Promise((res, rej) => {
      if (symbol === 'ETH-TEST') {
        return res({ [currencies]: 0 });
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
    const throttlePromice = new Promise((res, rej) => {
      if (currency === 'ETH-TEST') {
        const resp = {};

        symbols.forEach(symbol => {
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
              fsyms: symbols.toString(),
              tsyms: currency,
            },
          })
          .then(resp => {
            if (resp.data.Response === 'Error') {
              return rej(resp.data);
            }

            return res(resp.data);
          })
          .catch(e => rej(e));
      });
    });

    return throttlePromice;
  },
};
