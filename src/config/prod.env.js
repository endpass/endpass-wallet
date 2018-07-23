const hdKeyMnemonic = {
  // phrase: '', //BIP39 mnemonic
  // seed: '', //Derived from mnemonic phrase
  path: `m/44'/60'/0'/0`, //Derivation path
};
const infuraConf = {
  key: 'zU4GTAQ0LjJNKddbyztc',
};
const serviceThrottleTimeout = 2000;
const subscriptionsAPIInterval = 5000;
const subscriptionsBlockchainInterval = 3000;
const identityAPIUrl = 'http://user-url-for-prod.com';
const tokenInfoAPIUrl = 'http://user-url-for-prod.com';

// Parameters for cipher encrypting wallet
const kdfParams = {
  kdf: 'scrypt',
  n: 8192,
};

export default {
  hdKeyMnemonic,
  infuraConf,
  serviceThrottleTimeout,
  subscriptionsAPIInterval,
  subscriptionsBlockchainInterval,
  identityAPIUrl,
  tokenInfoAPIUrl,
  kdfParams,
};
