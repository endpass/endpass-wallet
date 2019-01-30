export { createENSClass } from './ens';
export { createWalletClass } from './wallet';
export { createERC20TokenClass } from './erc20';

export { ProxyRequest } from './singleton';

export {
  createTransactionClass,
  LocalStorage,
  SettingsStorage,
  ProviderFactory,
  InpageProvider,
  TransactionFactory,
  dappBridge,
  NotificationError,
} from '@endpass/class';

export { TrezorProxy } from './wallet/proxy';
export { LedgerProxy } from './wallet/proxy';
export { HDProxy } from './wallet/proxy';
