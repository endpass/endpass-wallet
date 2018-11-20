import web3 from 'web3';
import { WALLET_TYPE, HARDWARE_WALLET_TYPE } from '@/constants';
import { TrezorWallet, LedgerWallet } from '@/class';

const { isAddress, hexToBytes, bytesToHex, toChecksumAddress } = web3.utils;

// A wallet based on an Ethereum address string, to be used in place of
// ethereumjs-wallet when only the address is available
export default class Address {
  constructor({ address, info }) {
    const addressString = `0x${address.replace(/^0x/, '')}`;

    if (!isAddress(addressString)) {
      throw new Error('Not a valid Ethereum address');
    }

    this.address = hexToBytes(addressString);
    this.isPublic = true;
    this._privKey = null;
    this._pubKey = null;
    this.privKey = null;
    this.pubKey = null;

    if (!info) return;

    this.info = info;

    const isHardware = Object.values(HARDWARE_WALLET_TYPE).includes(info.type);

    if (!isHardware) return;

    this.isPublic = false;

    switch (info.type) {
      case WALLET_TYPE.TREZOR:
        this.signStrategy = TrezorWallet;
        break;

      case WALLET_TYPE.LEDGER:
        this.signStrategy = LedgerWallet;
        break;

      default:
        console.warn(`Can't match hardware type ${info.type}`);
        this.signStrategy = null;
        break;
    }
  }

  getAddress() {
    return this.address;
  }

  getAddressString() {
    return bytesToHex(this.address);
  }

  getChecksumAddressString() {
    return toChecksumAddress(this.getAddressString());
  }

  /**
   * Return signed message object
   * @param {String} message Message for signing
   * @return {Promise<Object<SignedMessage>>} Return signed message object
   */
  sign(message) {
    return this.signStrategy.sign(message, this.info.index);
  }

  /**
   * Return signed transaction hash
   * @param {Transaction} transaction Transaction instance
   * @return {String<SignedTrxHash>} Resolve signed transaction hash
   */
  signTransaction(transaction) {
    return this.signStrategy.signTransaction(transaction, this.info.index);
  }

  /**
   * Recover account address from signed message/hash
   * @param {String} message Message/hash for signing
   * @param {String<Signature>} signature Signature from signing
   * @return {Promise<Address>} Resolve account address
   */
  recover(message, signature) {
    return this.signStrategy.recover(message, signature);
  }
}
