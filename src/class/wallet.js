import { kdfParams } from '@/config';
import keyUtil from '@/utils/keystore';
import ethUtil from 'ethereumjs-util';

// A Wallet represents a single Ethereum account that can send transactions
// All methods are async and return promises
export class Wallet {
  constructor(v3Keystore) {
    this.v3 = v3Keystore;
  }

  async getPrivateKey(password) {
    return keyUtil.decrypt(password, this.v3);
  }

  async getPrivateKeyString(password) {
    let privateKey = await this.getPrivateKey(password);
    return ethUtil.bufferToHex(privateKey);
  }

  async exportToJSON(password) {
    return this.v3;
  }

  async getAddressString() {
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
    return transaction.sign(this.getPrivateKey(password));
  }
}
