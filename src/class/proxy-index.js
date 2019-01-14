export { createWalletClass } from './wallet';

export {
  createTransactionClass,
  createERC20TokenClass,
  createENSClass,
  LocalStorage,
  SettingsStorage,
  ProviderFactory,
  InpageProvider,
  TransactionFactory,
  dappBridge,
  NotificationError,
  EventEmitter,
} from '@endpass/class';

export { TrezorProxy } from './wallet/proxy';
export { LedgerProxy } from './wallet/proxy';
export { HDProxy } from './wallet/proxy';
