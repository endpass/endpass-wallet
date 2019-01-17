import { loadProxy } from '@endpass/class';

jest.mock('@/class', () => {
  const web3 = require.requireActual('@/class/singleton/web3').default;
  const erc20 = require.requireActual('./erc20').default;
  const ens = require.requireActual('./ens').default;

  const originClass = require.requireActual('@/class');

  const proxies = {
    TrezorProxy: {
      getNextWallets: jest.fn(),
    },
    LedgerProxy: {
      getNextWallets: jest.fn(),
    },
    HDProxy: {
      getNextWallets: jest.fn(),
    },
  };

  const loadProxy = proxy => proxy;

  return {
    ...originClass,
    proxies,
    loadProxy,
    web3,
    ENSResolver: ens,
    ERC20Token: erc20,
  };
});
