const hdKeyMnemonic = {
  // phrase: '', //BIP39 mnemonic
  // seed: '', //Derived from mnemonic phrase
  path: `m/44'/60'/0'/0`, //Derivation path
};
const infuraConf = {
  key: 'zU4GTAQ0LjJNKddbyztc',
};
const serviceThrottleTimeout = 2000;

// Polling interval for web3
const blockUpdateInterval = 15 * 1000;

const identityAPIUrl = 'https://identity.endpass.com/api/v1';
const cryptoDataAPIUrl = 'https://cryptodata.endpass.com/api/v1';

// ERC20 Tokens
const tokenInfoAPIUrl = 'https://tokeninfo.endpass.com/api/v1';
const tokenImageUrl = 'https://tokeninfo.endpass.com';

// Fiat Price
const priceUpdateInterval = 30 * 1000;
const fiatPriceAPIUrl = 'https://min-api.cryptocompare.com/data/price';
const fiatPriceMultiAPIUrl =
  'https://min-api.cryptocompare.com/data/pricemulti';

// Parameters for cipher encrypting wallet
const kdfParams = {
  kdf: 'scrypt',
  n: 8192,
};

export default {
  hdKeyMnemonic,
  infuraConf,
  serviceThrottleTimeout,
  blockUpdateInterval,
  priceUpdateInterval,
  fiatPriceAPIUrl,
  fiatPriceMultiAPIUrl,
  cryptoDataAPIUrl,
  identityAPIUrl,
  tokenImageUrl,
  tokenInfoAPIUrl,
  fiatPriceAPIUrl,
  kdfParams,
};
