import devEnv from './dev.env';
import prodEnv from './prod.env';

let env;

switch (process.env.NODE_ENV) {
  case 'production':
    env = prodEnv;
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
  identityAPIUrl,
  tokenInfoAPIUrl,
  kdfParams,
} = env;
