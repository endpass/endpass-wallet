import { infuraConf } from '@/config';

export const MAIN_NET_ID = 1;

export const DEFAULT_NETWORKS = Object.freeze([
  {
    id: 1,
    networkType: 'main',
    currency: 1,
    name: 'Main',
    url: `https://mainnet.infura.io/${infuraConf.key}`,
  },
  {
    name: 'Ropsten',
    currency: 2,
    networkType: 'ropsten',
    id: 3,
    url: `https://ropsten.infura.io/${infuraConf.key}`,
  },
  {
    name: 'Rinkeby',
    currency: 2,
    networkType: 'rinkeby',
    id: 4,
    url: `https://rinkeby.infura.io/${infuraConf.key}`,
  },
  {
    name: 'Ethereum classic',
    currency: 3,
    networkType: 'ethClassic',
    id: 61,
    url: 'https://etc-geth.0xinfra.com',
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

export const IDENTITY_MODE = {
  DEFAULT: 'default',
  CUSTOM: 'custom',
  LOCAL: 'local',
};

export default {
  MAIN_NET_ID,
  DEFAULT_NETWORKS,
  CURRENCIES,
  IDENTITY_MODE: Object.freeze(IDENTITY_MODE),
};
