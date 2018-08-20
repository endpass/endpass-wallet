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
  allowedDomain,
  hdKeyMnemonic,
  infuraConf,
  serviceThrottleTimeout,
  blockUpdateInterval,
  priceUpdateInterval,
  tokenUpdateInterval,
  fiatPriceAPIUrl,
  fiatPriceMultiAPIUrl,
  cryptoDataAPIUrl,
  identityAPIUrl,
  tokenImageUrl,
  tokenInfoAPIUrl,
  kdfParams,
} = env;
