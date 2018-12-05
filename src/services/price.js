import { http } from '@/class/singleton';

import throttledQueue from 'throttled-queue';

const throttle = throttledQueue(3, ENV.serviceThrottleTimeout);

export default {
  getEthPrice(toSymbol) {
    return this.getPrices('ETH', toSymbol);
  },
  getPrices(fromSymbols, toSymbol) {
    const fromSymbolsArray =
      fromSymbols instanceof Array ? fromSymbols : [fromSymbols];

    return new Promise((res, rej) => {
      if (toSymbol === 'ETH-TEST') {
        const response = fromSymbolsArray.reduce((accumulator, symbol) => {
          accumulator[symbol] = {
            [toSymbol]: 0,
          };

          return accumulator;
        }, {});

        return res(response);
      }

      if (fromSymbols === 'ETH-TEST') {
        return res({ [toSymbol]: 0 });
      }

      throttle(() => {
        http
          .get(`${ENV.cryptoDataAPIUrl}/price`, {
            params: {
              from: fromSymbolsArray.join(','),
              to: toSymbol,
            },
          })
          .then(resp => res(resp.data))
          .catch(e => rej(e));
      });
    });
  },
};
