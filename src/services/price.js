import axios from 'axios';
import throttledQueue from 'throttled-queue';
import { serviceThrottleTimeout } from '@/config';
let throttle = throttledQueue(3, serviceThrottleTimeout);

export default {
  getPrice(symbol, currencys) {
    let throttlePromice = new Promise((res, rej) => {
      throttle(() => {
        if (symbol === 'ETH-TEST') {
          let resp = {};
          resp[currencys] = 0;
          return res(resp);
        }
        axios
          .get(`https://min-api.cryptocompare.com/data/price`, {
            params: {
              fsym: symbol,
              tsyms: currencys,
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
          .get(`https://min-api.cryptocompare.com/data/pricemulti`, {
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
