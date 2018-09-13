import axios from 'axios';
import throttledQueue from 'throttled-queue';
import { Transaction } from '@/class';

let throttle = throttledQueue(1, 5000);

export default {
  getTokensWithBalance(address) {
    let throttlePromice = new Promise((res, rej) => {
      throttle(() => {
        axios
          .get(`https://api.ethplorer.io/getAddressInfo/${address}`, {
            params: {
              limit: 50,
              apiKey: 'freekey',
            },
          })
          .then(resp => {
            res(
              (resp.data.tokens || [])
                .filter(this.tokenIsNotSpam)
                .map(token => token.tokenInfo),
            );
          })
          .catch(rej);
      });
    });
    return throttlePromice;
  },
  getHistory(address) {
    let throttlePromice = new Promise((res, rej) => {
      throttle(() => {
        axios
          .get(`https://api.ethplorer.io/getAddressHistory/${address}`, {
            params: {
              limit: 50,
              apiKey: 'freekey',
            },
          })
          .then(resp => res(resp.data.operations || []))
          .catch(rej);
      });
    });
    return throttlePromice;
  },
  getInfo(address) {
    let throttlePromice = new Promise((res, rej) => {
      throttle(() => {
        axios
          .get(`https://api.ethplorer.io/getAddressTransactions/${address}`, {
            params: {
              limit: 50,
              apiKey: 'freekey',
            },
          })
          .then(resp => res(resp.data || []))
          .catch(rej);
      });
    });
    return throttlePromice;
  },

  // get tokens and ETH transactions
  async getTransactionHistory(address) {
    const [transactions, history] = await Promise.all([
      this.getInfo(address),
      this.getHistory(address),
    ]);
    return transactions.concat(history).map(trx => new Transaction(trx));
  },
  // Filter out spam balances of tokens
  tokenIsNotSpam(token) {
    return token && token.tokenInfo && token.tokenInfo.price;
  },
};
