export const MAIN_NET_ID = 1;

export const NETWORK_URL = Object.freeze({
  ETH: [
    'wss://eth-mainnet.endpass.com:2084',
    'https://eth-mainnet.endpass.com:2083',
    `https://mainnet.infura.io/${ENV.infuraConf.key}`,
  ],
  ROP: [
    'wss://eth-ropsten.endpass.com:2084',
    'https://eth-ropsten.endpass.com:2083',
    `https://ropsten.infura.io/${ENV.infuraConf.key}`,
  ],
  RIN: `https://rinkeby.infura.io/${ENV.infuraConf.key}`,
  ETC: [
    'wss://etc-mainnet.endpass.com:2084',
    'https://etc-mainnet.endpass.com:2083',
    'https://etc-geth.0xinfra.com',
  ],
});

export const DEFAULT_NETWORKS = Object.freeze([
  {
    id: 1,
    networkType: 'main',
    currency: 1,
    name: 'Main',
    url: NETWORK_URL.ETH,
  },
  {
    id: 3,
    name: 'Ropsten',
    networkType: 'ropsten',
    currency: 2,
    url: NETWORK_URL.ROP,
  },
  {
    id: 4,
    name: 'Rinkeby',
    networkType: 'rinkeby',
    currency: 2,
    url: NETWORK_URL.RIN,
  },
  {
    id: 61,
    name: 'Ethereum classic',
    networkType: 'ethClassic',
    currency: 3,
    url: NETWORK_URL.ETC,
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

export const DAPP_WHITELISTED_METHODS = [
  'personal_sign',
  'eth_personalSign',
  'eth_signTypedData',
  'eth_sendTransaction',
];

export const TRANSACTION_STATUS = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  CANCELED: 'canceled',
  PENDING: 'pending',
  RESENT: 'resent',
});

export default {
  AVAILABLE_FIAT_CURRENCIES,
  MAIN_NET_ID,
  DEFAULT_NETWORKS,
  CURRENCIES,
  IDENTITY_MODE,
  DAPP_WHITELISTED_METHODS,
  TRANSACTION_STATUS,
};
