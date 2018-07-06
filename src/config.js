const infuraConf = {
  key: 'zU4GTAQ0LjJNKddbyztc'
}
const hdKeyMnemonic = {
  // phrase: '', //BIP39 mnemonic
  // seed: '', //Derived from mnemonic phrase
  path: `m/44'/60'/0'/0`, //Derivation path
}
const serviceThrottleTimeout = 2000;
const subscribtionsAPIInterval = 5000;
const subscribtionsBlockchainInterval = 3000;
export {infuraConf, serviceThrottleTimeout, subscribtionsAPIInterval, subscribtionsBlockchainInterval, hdKeyMnemonic}
