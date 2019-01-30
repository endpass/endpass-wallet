// external point for other modules
export { default as EventEmitter } from './EventEmitter';
export { ProviderFactory } from './provider';

export { default as web3 } from './singleton/web3';
export { dappBridge, ajv, proxyRequest, http, httpIdentity } from './singleton';

export { default as InpageProvider } from './provider/InpageProvider';
export { LocalStorage, SettingsStorage } from './storage';

export {
  default as TransactionFactory,
} from './transaction/TransactionFactory';
export { default as Transaction } from './transaction/Transaction';
export { NotificationError } from './error';
export { default as Wallet } from './wallet';
export { default as ENSResolver } from './ens';
export { default as Token } from './Token';
export { default as ERC20Token } from './erc20';
export { TrezorProxy } from './wallet/proxy';
export { LedgerProxy } from './wallet/proxy';
export { HDProxy } from './wallet/proxy';
