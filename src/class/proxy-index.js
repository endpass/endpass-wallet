export { createENSClass } from './ens';
export { createWalletClass } from './wallet';
export { createTransactionClass } from './transaction/Transaction';
export { createERC20TokenClass } from './erc20';

export { ProxyRequest } from './singleton';

export { default as dappBridge } from './singleton/dappBridge';
export {
  LocalStorage,
  SettingsStorage,
  ProviderFactory,
  InpageProvider,
} from '@endpass/class';

export {
  default as TransactionFactory,
} from './transaction/TransactionFactory';
export { TrezorProxy } from './wallet/proxy';
export { LedgerProxy } from './wallet/proxy';
export { HDProxy } from './wallet/proxy';
