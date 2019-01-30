jest.mock('@/class', () => {
  const web3 = require.requireActual('@/class/singleton/web3').default;
  const erc20 = require.requireActual('./erc20').default;
  const ens = require.requireActual('./ens').default;
  const LocalStorage = require.requireActual('./localStorage').default;
  const dappBridge = require.requireActual('./dappBridge').default;
  const InpageProvider = require.requireActual('./InpageProvider').default;
  const proxies = require.requireActual('./proxies').default;

  const originClass = require.requireActual('@/class');

  originClass.Wallet.loadProxy = proxy => proxies[proxy];

  return {
    ...originClass,
    InpageProvider,
    dappBridge,
    LocalStorage,
    web3,
    ENSResolver: ens,
    ERC20Token: erc20,
  };
});
