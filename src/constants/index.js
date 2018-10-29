export { INPAGE_EVENT, INPAGE_ID_PREFIX } from './InpageProvider';

export const MAIN_NET_ID = 1;
export const DEFAULT_NETWORKS = Object.freeze([
  {
    id: 1,
    networkType: 'main',
    currency: 1,
    name: 'Main',
    url: 'wss://eth-mainnet.endpass.com',
  },
  {
    name: 'Ropsten',
    currency: 2,
    networkType: 'ropsten',
    id: 3,
    url: 'wss://eth-ropsten.endpass.com',
  },
  {
    name: 'Rinkeby',
    currency: 2,
    networkType: 'rinkeby',
    id: 4,
    url: `https://rinkeby.infura.io/${ENV.infuraConf.key}`,
  },
  {
    name: 'Ethereum classic',
    currency: 3,
    networkType: 'ethClassic',
    id: 61,
    url: 'wss://etc-mainnet.endpass.com/',
  },
]);

export const CURRENCIES = Object.freeze([
  {
    name: 'ETH',
    id: 1,
  },
  {
    name: 'ETH-TEST',
    id: 2,
  },
  {
    name: 'ETC',
    id: 3,
  },
]);

export const AVAILABLE_FIAT_CURRENCIES = Object.freeze(
  // prettier-ignore
  ['USD', 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR'],
);

export const IDENTITY_MODE = Object.freeze({
  DEFAULT: 'default',
  CUSTOM: 'custom',
  LOCAL: 'local',
});

export const PROXY_REQUEST_PREFIX = 'endpass-identity';

export const STORAGE_USER_META_KEY = 'endpass-user-meta';

export const AVAILABLE_USER_META_PROPS = ['activeAccount'];

export const REQUEST_TIMEOUT_MSEC = 30000;

export default {
  AVAILABLE_FIAT_CURRENCIES,
  MAIN_NET_ID,
  DEFAULT_NETWORKS,
  CURRENCIES,
  IDENTITY_MODE,
  PROXY_REQUEST_PREFIX,
  STORAGE_USER_META_KEY,
  AVAILABLE_USER_META_PROPS,
  REQUEST_TIMEOUT_MSEC,
};
