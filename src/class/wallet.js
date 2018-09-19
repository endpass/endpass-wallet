import Tx from 'ethereumjs-tx';
import { kdfParams } from '@/config';
import web3 from 'web3';
import keyUtil from '@/utils/keystore';

// A Wallet represents a single Ethereum account that can send transactions
// All methods are async and return promises
export class Wallet {
  constructor(v3Keystore) {
    this.isPublic = false;
    this.v3 = v3Keystore;
  }

  async getPrivateKey(password) {
    return keyUtil.decrypt(password, this.v3);
  }

  async getPrivateKeyString(password) {
    const privateKey = await this.getPrivateKey(password);
    return web3.utils.bytesToHex(privateKey);
  }

  // () => Promise<String>
  async exportToJSON() {
    return JSON.stringify(this.v3);
  }

  getAddressString() {
    return this.v3.address;
  }

  async validatePassword(password) {
    try {
      await this.getPrivateKey(password);
      return true;
    } catch (e) {
      throw new Error('Invalid password');
    }
  }

  async signTransaction(transaction, password) {
    const privateKey = await this.getPrivateKey(password);
    const tx = transaction instanceof Tx ? transaction : new Tx(transaction);

    await tx.sign(privateKey);

    return `0x${tx.serialize().toString('hex')}`;
  }
}
