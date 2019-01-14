// external point for other modules
import {
  createERC20TokenClass,
  createENSClass,
  createWalletClass,
  createTransactionClass,
} from './proxy-index';
import web3 from './singleton/web3';

const ERC20Token = createERC20TokenClass(web3);
const ENSResolver = createENSClass(web3);
const Wallet = createWalletClass(web3);
const Transaction = createTransactionClass(web3);

export { web3, ERC20Token, ENSResolver, Wallet, Transaction };

export { default as ajv } from './singleton/ajv';
export { default as http } from './singleton/http';

export {
  ProviderFactory,
  default as dappBridge,
  default as InpageProvider,
  LocalStorage,
  SettingsStorage,
  default as TransactionFactory,
  NotificationError,
  default as Token,
  TrezorProxy,
  LedgerProxy,
  HDProxy,
  EventEmitter,
} from './proxy-index';
