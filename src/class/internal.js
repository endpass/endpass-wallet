// external point for other modules
export { default as EventEmitter } from './EventEmitter';
export { ProviderFactory } from './provider';

export { LocalStorage, SettingsStorage } from './storage';

export {
  default as TransactionFactory,
} from './transaction/TransactionFactory';
export { default as Transaction } from './Transaction';
export { NotificationError } from './error';
export { default as Wallet } from './wallet';
export { default as ENSResolver } from './ens';
export { default as Token } from './Token';
export { default as ERC20Token } from './erc20';
