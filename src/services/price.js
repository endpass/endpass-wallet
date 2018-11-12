import { http } from '@/class/singleton';

import throttledQueue from 'throttled-queue';

const throttle = throttledQueue(3, ENV.serviceThrottleTimeout);

export default {
  getPrice(symbol, currencies) {
    const throttlePromice = new Promise((res, rej) => {
      if (symbol === 'ETH-TEST') {
        return res({ [currencies]: 0 });
      }
      throttle(() => {
        http
          .get(ENV.fiatPriceAPIUrl, {
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
        http
          .get(ENV.fiatPriceMultiAPIUrl, {
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
