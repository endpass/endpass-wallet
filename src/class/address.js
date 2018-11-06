import web3 from 'web3';
import { WALLET_TYPE, HARDWARE_WALLET_TYPE } from '@/constants';
import { TrezorWallet } from '@/class';

// A wallet based on an Ethereum address string, to be used in place of
// ethereumjs-wallet when only the address is available
export default class Address {
  constructor({ address, info }) {
    const addressString = `0x${address.replace(/^0x/, '')}`;

    if (!web3.utils.isAddress(addressString)) {
      throw new Error('Not a valid Ethereum address');
    }

    this.address = web3.utils.hexToBytes(addressString);
    this.isPublic = true;
    this._privKey = null;
    this._pubKey = null;
    this.privKey = null;
    this.pubKey = null;

    if (info) {
      this.info = info;

      const isHardware = Object.values(HARDWARE_WALLET_TYPE).includes(
        info.type,
      );

      if (isHardware) {
        this.isPublic = false;
      }

      switch (info.type) {
        case WALLET_TYPE.TREZOR:
          this.signStrategy = TrezorWallet;
          break;

        default:
          this.signStrategy = TrezorWallet;
          break;
      }
    }
  }

  getAddress() {
    return this.address;
  }

  getAddressString() {
    return web3.utils.bytesToHex(this.address);
  }

  getChecksumAddressString() {
    return web3.utils.toChecksumAddress(this.getAddressString());
  }

  // (Message) => Promise<SignedMessage>
  sign(message) {
    return this.signStrategy.sign(message, this.info.index);
  }

  // (Transaction) => Promise<SignedTrx>
  signTransaction(transaction) {
    return this.signStrategy.signTransaction(transaction, this.info.index);
  }
}
