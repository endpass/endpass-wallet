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

export const REQUEST_TIMEOUT_MSEC = 30000;

export const STORAGE_USER_META_KEY = 'endpass-user-meta';

export const ENCRYPT_OPTIONS = {
  kdf: ENV.VUE_APP_KDF_PARAMS_KDF,
  n: ENV.VUE_APP_KDF_PARAMS_N,
};

export const LOCALES = ['en'];

export default {
  REQUEST_TIMEOUT_MSEC,
  STORAGE_USER_META_KEY,
  AVAILABLE_FIAT_CURRENCIES,
  IDENTITY_MODE,
  DAPP_WHITELISTED_METHODS,
  TRANSACTION_STATUS,
  ENCRYPT_OPTIONS,
  LOCALES
};
