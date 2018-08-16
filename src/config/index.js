import devEnv from './dev.env';
import prodEnv from './prod.env';
import testEnv from './test.env';

let env;

switch (process.env.NODE_ENV) {
  case 'production':
    env = prodEnv;
    break;
  case 'test': // set by Jest
  case 'testing':
    env = {
      ...prodEnv,
      ...testEnv,
    };
    break;

  default:
    env = {
      ...prodEnv,
      ...devEnv,
    };
    break;
}

export const {
  hdKeyMnemonic,
  infuraConf,
  serviceThrottleTimeout,
  subscriptionsAPIInterval,
  subscriptionsBlockchainInterval,
  fiatPriceAPIUrl,
  fiatPriceMultiAPIUrl,
  cryptoDataAPIUrl,
  identityAPIUrl,
  tokenImageUrl,
  tokenInfoAPIUrl,
  kdfParams,
} = env;
