import devEnv from './dev.env';
import prodEnv from './prod.env';
import testEnv from './test.env';

let env;

// NODE_ENV from webpack DefinePlugin or Jest globals
switch (NODE_ENV) {
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
  blockUpdateInterval,
  priceUpdateInterval,
  fiatPriceAPIUrl,
  fiatPriceMultiAPIUrl,
  cryptoDataAPIUrl,
  identityAPIUrl,
  tokenImageUrl,
  tokenInfoAPIUrl,
  kdfParams,
  googleAnalyticsId,
  intercomAppId,
} = env;

export const isProduction = NODE_ENV === 'production';
