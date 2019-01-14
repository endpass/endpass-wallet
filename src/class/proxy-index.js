export { createENSClass } from './ens';
export { createWalletClass } from './wallet';
export { createTransactionClass } from './transaction/Transaction';
export { createERC20TokenClass } from './erc20';

export { ProxyRequest } from './singleton';

export { ProviderFactory } from './provider';

export { default as dappBridge } from './singleton/dappBridge';
export { default as InpageProvider } from './provider/InpageProvider';
export { LocalStorage, SettingsStorage } from './storage';

export {
  default as TransactionFactory,
} from './transaction/TransactionFactory';
export { NotificationError } from './error';
export { default as Token } from './Token';
export { TrezorProxy } from './wallet/proxy';
export { LedgerProxy } from './wallet/proxy';
export { HDProxy } from './wallet/proxy';
