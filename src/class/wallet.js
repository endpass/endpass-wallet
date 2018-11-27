import { get } from 'lodash';
import Tx from 'ethereumjs-tx';
import web3 from '@/utils/web3';
import keystore from '@/utils/keystore';
import { TrezorWallet, LedgerWallet } from '@/class';
import { WALLET_TYPE, HARDWARE_WALLET_TYPE } from '@/constants';

const { isAddress, bytesToHex, toChecksumAddress } = web3.utils;

// A Wallet represents a single Ethereum account that can send transactions
// All methods are async and return promises
export default class Wallet {
  constructor(account) {
    const address = Wallet.normalizeAddress(account.address);

    if (!isAddress(address)) {
      throw new Error(`${address} is not valid Etherium address!`);
    }

    this.address = address;
    this.isPublic = true;
    this.v3 = null;
    this.signStrategy = null;

    this.init(account);
  }

  static normalizeAddress(address) {
    return `0x${address.replace(/^0x/, '')}`;
  }

  init(account) {
    if (!keystore.isV3(account)) return;

    const accountType = get(account, 'info.type');
    const isHardware = Object.values(HARDWARE_WALLET_TYPE).includes(
      accountType,
    );

    this.isPublic = false;
    this.v3 = account;

    if (isHardware) {
      this.applyHardwareStrategy(accountType);
    }
  }

  applyHardwareStrategy(accountType) {
    switch (accountType) {
      case WALLET_TYPE.TREZOR:
        this.signStrategy = TrezorWallet;
        break;
      case WALLET_TYPE.LEDGER:
        this.signStrategy = LedgerWallet;
        break;
      default:
        /* eslint-disable-next-line */
        console.warn(`Can't match hardware type ${accountType}`);
        this.signStrategy = null;
    }
  }

  async getPrivateKey(password) {
    return keystore.decrypt(password, this.v3);
  }

  async getPrivateKeyString(password) {
    const privateKey = await this.getPrivateKey(password);

    return bytesToHex(privateKey);
  }

  // () => Promise<String>
  async exportToJSON() {
    return JSON.stringify(this.v3);
  }

  async getAddressString() {
    return this.address;
  }

  getChecksumAddressString() {
    return toChecksumAddress(this.address);
  }

  async validatePassword(password) {
    try {
      await this.getPrivateKey(password);

      return true;
    } catch (e) {
      throw new Error('Invalid password');
    }
  }

  /**
   * Return signed message object
   * @param {String} message Message for signing
   * @return {Promise<Object<SignedMessage>>} Return signed message object
   */
  async sign(data, password) {
    const privateKey = await this.getPrivateKeyString(password);

    return web3.eth.accounts.sign(data, privateKey);
  }

  /**
   * Recover account address from signed message/hash
   * @param {String} message Message/hash for signing
   * @param {String<Signature>} signature Signature from signing
   * @return {Promise<Address>} Resolve account address
   */
  /* eslint-disable-next-line */
  async recover(message, signature) {
    return web3.eth.accounts.recover(message, signature);
  }

  /**
   * Return signed transaction hash
   * @param {Transaction} transaction Transaction instance
   * @return {String<SignedTrxHash>} Resolve signed transaction hash
   */
  async signTransaction(transaction, password) {
    const privateKey = await this.getPrivateKey(password);
    const tx = transaction instanceof Tx ? transaction : new Tx(transaction);

    await tx.sign(privateKey);

    return `0x${tx.serialize().toString('hex')}`;
  }
}
