import axios from 'axios';
import throttledQueue from 'throttled-queue';

const throttle = throttledQueue(1, 5000);

export default {
  getTokensWithBalance(address) {
    return new Promise((res, rej) => {
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
  },
  getHistory(address) {
    return new Promise((res, rej) => {
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
  },
  getInfo(address) {
    return new Promise((res, rej) => {
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
  },

  // get tokens and ETH transactions
  getTransactionHistory(address) {
    return new Promise((res, rej) => {
      throttle(() => {
        Promise.all([this.getInfo(address), this.getHistory(address)])
          .then(([transactions, history]) => {
            res(transactions.concat(history));
          })
          .catch(rej);
      });
    });
  },
  // Filter out spam balances of tokens
  tokenIsNotSpam(token) {
    return token && token.tokenInfo && token.tokenInfo.price;
  },
};
