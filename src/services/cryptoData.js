import throttledQueue from 'throttled-queue';

import { NotificationError, http } from '@/class';
import { cryptoDataValidator } from '@/schema';

const throttle = throttledQueue(3, ENV.serviceThrottleTimeout);

export default {
  getSymbolsPrice(fromSymbols, toSymbol) {
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

      throttle(async () => {
        try {
          const { data } = await http.get(`${ENV.cryptoDataAPIUrl}/price`, {
            params: {
              from: fromSymbolsArray.join(','),
              to: toSymbol,
            },
          });

          res(cryptoDataValidator.validateSymbolsPrice(data));
        } catch (e) {
          rej(e);
        }
      });
    });
  },

  async getGasPrice() {
    try {
      const { data } = await http.get(`${ENV.cryptoDataAPIUrl}/gas/price`);

      return cryptoDataValidator.validateGasPrice(data);
    } catch (err) {
      throw new NotificationError({
        title: 'Failed to get suggested gas price',
        text:
          'An error occurred while retrieving suggested gas price. Please, set manually or, try again.',
        type: 'is-warning',
      });
    }
  },
};
