import Tx from 'ethereumjs-tx';
import HDKey from 'ethereumjs-wallet/hdkey';
import web3 from '@/class/singleton/web3';
import { keystore } from '@endpass/utils';
import { WALLET_TYPE, HARDWARE_WALLET_TYPE } from '@/constants';
import { TrezorProxy, LedgerProxy } from './proxy';

const { isAddress, bytesToHex, toChecksumAddress } = web3.utils;

const strategies = {
  [WALLET_TYPE.TREZOR]: TrezorProxy,
  [WALLET_TYPE.LEDGER]: LedgerProxy,
};

/**
 * A Wallet represents a single Ethereum account that can send transactions
 * ! All methods are async and return promises
 * @constructor
 * @param {Object} account Account object
 */
export default class Wallet {
  constructor({ info = {}, ...v3Keystore }) {
    const address = Wallet.normalizeAddress(v3Keystore.address);

    if (!isAddress(address)) {
      throw new Error(`${address} is not valid Etherium address!`);
    }

    const { type: accountType, index } = info;

    const isPublic = !keystore.isV3(v3Keystore);
    const isHardware = Object.values(HARDWARE_WALLET_TYPE).includes(
      accountType,
    );

    this.address = address;
    this.index = index;
    this.v3 = isPublic ? null : v3Keystore;
    this.signStrategy = null;
    this.isPublic = isPublic;
    this.isHardware = isHardware;

    if (isHardware) {
      this.isPublic = false;
      this.applyHardwareStrategy(accountType);
    }
  }

  /**
   *
   * @param {*} address
   */
  static normalizeAddress(address) {
    if (/^xpub/.test(address)) {
      return Wallet.getAddressFromXpub(address);
    }

    return `0x${address.replace(/^0x/, '')}`;
  }

  /**
   * Returns checksummed address from xpub
   * @param {String} xpub
   * @returns {String} Checksummed address
   */
  static getAddressFromXpub(xpub) {
    const hdWallet = HDKey.fromExtendedKey(xpub);

    return hdWallet.getWallet().getChecksumAddressString();
  }

  /**
   * Applies sign strategy to wallet by given account type
   * If wallet is not supported – throws error
   * @param {String} accountType
   * @throws {Error}
   */
  applyHardwareStrategy(accountType) {
    const strategy = strategies[accountType];
    if (!strategy) {
      throw new Error(`${accountType} hardware wallet is not supported yet!`);
    }
    this.signStrategy = strategy;
  }

  /**
   * Returns decrypted private key buffer
   * @param {String} password Account password
   * @returns {Promise<Buffer>} Private key buffer
   */
  async getPrivateKey(password) {
    return keystore.decrypt(password, this.v3);
  }

  /**
   * Returns decrypted private key in string
   * @param {String} password Account password
   * @returns {Promise<String>} Private key string
   */
  async getPrivateKeyString(password) {
    const privateKey = await this.getPrivateKey(password);

    return bytesToHex(privateKey);
  }

  /**
   * Returns accoutn in JSON string
   * @returns (Promise<String>)
   */
  async exportToJSON() {
    return JSON.stringify(this.v3);
  }

  /**
   * Returns checksummed wallet address
   * @returns {String}
   */
  getChecksumAddressString() {
    return toChecksumAddress(this.address);
  }

  /**
   * Validates account password
   * Throws error on validation failure
   * @param {String} password Account password
   * @throws {Error}
   * @returns {Boolean}
   */
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
    if (this.isHardware) {
      return this.signStrategy.sign(data, this.index);
    }

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
    if (this.isHardware) {
      return this.signStrategy.recover(message, signature);
    }

    return web3.eth.accounts.recover(message, signature);
  }

  /**
   * Return signed transaction hash
   * @param {Transaction} transaction Transaction instance
   * @return {String<SignedTrxHash>} Resolve signed transaction hash
   */
  async signTransaction(transaction, password) {
    if (this.isHardware) {
      return this.signStrategy.signTransaction(transaction, this.index);
    }

    const privateKey = await this.getPrivateKey(password);
    const tx = transaction instanceof Tx ? transaction : new Tx(transaction);

    await tx.sign(privateKey);

    return `0x${tx.serialize().toString('hex')}`;
  }
}
