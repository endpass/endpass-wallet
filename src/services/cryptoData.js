import { get, uniqBy, mapKeys, mapValues, identity } from 'lodash';
import throttledQueue from 'throttled-queue';
import { NotificationError } from '@/class';
import { http } from '@/class/singleton';
import { cryptoDataValidator } from '@/schema';

const throttle = throttledQueue(3, ENV.VUE_APP_SERVICE_THROTTLE_TIMEOUT);

const cryptoDataService = {
  /**
   * @returns {Promise<>}
   */
  async getGasPrice(network) {
    try {
      const { data } = await http.get(
        `${ENV.VUE_APP_CRYPTODATA_API_URL}/${network}/gas/price`,
      );

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
  getSymbolsPrices(fromSymbols, toSymbol) {
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

      return throttle(async () => {
        try {
          const res = await http.get(
            `${ENV.VUE_APP_CRYPTODATA_API_URL}/price`,
            {
              params: {
                from: fromSymbolsArray.join(','),
                to: toSymbol,
              },
            },
          );
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
            `${ENV.VUE_APP_CRYPTODATA_API_URL}/${network}/balance/${address}`,
          );
          const { balance, tokens } = cryptoDataValidator.validateBalance(
            res.data,
          );
          const actualTokens = tokens.filter(token => !!token.price);
          const tokensPrices = await cryptoDataService.getSymbolsPrices(
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
            `${ENV.VUE_APP_CRYPTODATA_API_URL}/${network}/transactions/${address}/token`,
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
            `${ENV.VUE_APP_CRYPTODATA_API_URL}/${network}/transactions/${address}`,
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
            uniqBy([].concat(transactionsWithTokens, transactions), 'hash'),
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
        `${ENV.VUE_APP_CRYPTODATA_API_URL}/${network}/transactions/pending`,
        {
          params: {
            filterId,
            from: fromAddress,
          },
        },
      );

      return cryptoDataValidator.validatePendingTransactions(data);
    } catch (err) {
      throw new Error(
        'Failed to get pending transactions. An error occurred while getting pending transactions.',
      );
    }
  },
};

export default cryptoDataService;
