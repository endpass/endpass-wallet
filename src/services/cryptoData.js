import { get, uniqBy, mapKeys, mapValues, identity } from 'lodash';
import throttledQueue from 'throttled-queue';
import { NotificationError } from '@/class';
import { http } from '@/class/singleton';
import { cryptoDataValidator } from '@/schema';

const throttle = throttledQueue(3, ENV.serviceThrottleTimeout);

const cryptoDataService = {
  /**
   * @returns {Promise<>}
   */
  async getGasPrice() {
    try {
      const { data } = await http.get('/cryptodata/api/v1/gas/price');

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

  /**
   * @param {String|Array<String>} fromSymbols
   * @param {String} toSymbol
   * @returns {Promise}
   */
  getSymbolsPrice(fromSymbols, toSymbol) {
    const fromSymbolsArray = [].concat(fromSymbols);
    const mappedFromSymbols = mapKeys(fromSymbolsArray, identity);
    const defaultSymbolsPrices = mapValues(mappedFromSymbols, () => ({}));

    return new Promise((resolve, reject) => {
      if (toSymbol === 'ETH-TEST') {
        return resolve(
          mapValues(mappedFromSymbols, () => ({
            'ETH-TEST': 0,
          })),
        );
      }

      if (fromSymbols === 'ETH-TEST') {
        return resolve({ [toSymbol]: 0 });
      }

      throttle(async () => {
        try {
          const res = await http.get(`/cryptodata/api/v1/price`, {
            params: {
              from: fromSymbolsArray.join(','),
              to: toSymbol,
            },
          });
          const data = cryptoDataValidator.validateSymbolsPrices(res.data);

          if (fromSymbolsArray.length > 1) {
            return resolve({
              ...defaultSymbolsPrices,
              ...data,
            });
          }

          return resolve({
            ...defaultSymbolsPrices,
            [fromSymbolsArray[0]]: data,
          });
        } catch (err) {
          return reject(err);
        }
      });
    });
  },

  /**
   * @param {Number} options.network
   * @param {String} options.address
   * @returns {Promise<Object>}
   */
  getAccountBalance({ network, address, toSymbol }) {
    return new Promise((resolve, reject) =>
      throttle(async () => {
        try {
          const res = await http.get(
            `/cryptodata/api/v1/balance/${network}/${address}/`,
            {
              params: {
                page: 1,
                limit: 50,
              },
            },
          );
          const { balance, tokens } = cryptoDataValidator.validateBalance(
            res.data,
          );
          const actualTokens = tokens.filter(token => !!token.price);
          const tokensPrices = await cryptoDataService.getSymbolsPrice(
            actualTokens.map(({ symbol }) => symbol),
            toSymbol,
          );

          return resolve({
            tokens: actualTokens.map(token => ({
              ...token,
              price: tokensPrices[token.symbol] || {},
            })),
            balance,
          });
        } catch (err) {
          return reject(err);
        }
      }),
    );
  },

  /**
   * @param {Number} options.network
   * @param {String} options.address
   * @returns {Promise<Array<Object>>}
   */
  getHistoryWithTokens({ network, address }) {
    return new Promise((resolve, reject) => {
      throttle(async () => {
        try {
          const res = await http.get(
            `/cryptodata/api/v1/transactions/${network}/${address}/token`,
            {
              params: {
                page: 1,
                limit: 50,
              },
            },
          );
          const data = cryptoDataValidator.validateTransactions(
            get(res, 'data', []),
          );

          return resolve(data);
        } catch (err) {
          return reject(err);
        }
      });
    });
  },

  /**
   * @param {Number} options.network
   * @param {String} options.address
   * @returns {Promise<Array<Object>>}
   */
  getHistory({ network, address }) {
    return new Promise((resolve, reject) => {
      throttle(async () => {
        try {
          const res = await http.get(
            `/cryptodata/api/v1/transactions/${network}/${address}/`,
            {
              params: {
                page: 1,
                limit: 50,
              },
            },
          );

          const data = cryptoDataValidator.validateTransactions(
            get(res, 'data', []),
          );

          return resolve(data);
        } catch (err) {
          return reject(err);
        }
      });
    });
  },

  /**
   * @param {Number} options.network
   * @param {String} options.address
   * @returns {Promise<Array<Object>>}
   */
  getTransactionHistory(params) {
    return new Promise((resolve, reject) => {
      throttle(async () => {
        try {
          const [transactions, transactionsWithTokens] = await Promise.all([
            cryptoDataService.getHistory(params),
            cryptoDataService.getHistoryWithTokens(params),
          ]);

          return resolve(
            uniqBy([].concat(transactions, transactionsWithTokens), 'hash'),
          );
        } catch (err) {
          return reject(err);
        }
      });
    });
  },

  async getPendingTransactions(network, fromAddress, filterId) {
    try {
      const { data } = await http.get(
        `${ENV.cryptoDataAPIUrl}/${network}/transactions/pending`,
        {
          params: {
            filterId,
            from: fromAddress,
          },
        },
      );

      return cryptoDataValidator.validatePendingTransactions(data);
    } catch (err) {
      throw new NotificationError({
        title: 'Failed to get pending transactions',
        text: 'An error occurred while getting pending transactions.',
        type: 'is-warning',
      });
    }
  },
};

export default cryptoDataService;
