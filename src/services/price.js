import axios from 'axios';
import throttledQueue from 'throttled-queue';
import { serviceThrottleTimeout } from '@/config';
let throttle = throttledQueue(1, serviceThrottleTimeout);

export default {
  getPrice(symbol, currencys) {
    let throttlePromice = new Promise((res, rej) => {
      throttle(() => {
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
  getEthPrice(currencys) {
    return this.getPrice('ETH', currencys);
  },
  getPrices(symbols, currencys) {
    let throttlePromice = new Promise((res, rej) => {
      throttle(() => {
        axios
          .get(`https://min-api.cryptocompare.com/data/pricemulti`, {
            params: {
              fsyms: symbols,
              tsyms: currencys,
            },
          })
          .then(resp => res(resp.data))
          .catch(e => rej(e));
      });
    });
    return throttlePromice;
  },
};
