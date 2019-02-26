// external point for other modules
import {
  createERC20TokenClass,
  createENSClass,
  createWalletClass,
} from '@endpass/class';
import web3 from './singleton/web3';

const ERC20Token = createERC20TokenClass(web3);
const ENSResolver = createENSClass(web3);
const Wallet = createWalletClass(web3);

export { web3, ERC20Token, ENSResolver, Wallet };

export { default as ajv } from './singleton/ajv';
export { default as http } from './singleton/http';
export { default as connect } from './singleton/connect';

export {
  ProviderFactory,
  LocalStorage,
  SettingsStorage,
  TransactionFactory,
  NotificationError,
  Token,
  EventEmitter,
  Transaction,
} from '@endpass/class';
