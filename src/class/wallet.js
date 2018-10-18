import Tx from 'ethereumjs-tx';
import web3 from '@/utils/web3';
// import web3i from '';
import keyUtil from '@/utils/keystore';

// A Wallet represents a single Ethereum account that can send transactions
// All methods are async and return promises
export default class Wallet {
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

  async sign(data, password) {
    const privateKey = await this.getPrivateKeyString(password);

    return web3.eth.accounts.sign(data, privateKey);
  }

  recover(message, signature) {
    return web3.eth.accounts.recover(message, signature);
  }

  async ecRecover(message, signature) {
    const res = await web3.eth.personal.ecRecover(message, signature);

    return res;
  }

  async personalSign(data, password) {
    const res = await web3.eth.personal.sign(data, this.v3.address, password);

    return res;
  }

  async signTransaction(transaction, password) {
    const privateKey = await this.getPrivateKey(password);
    const tx = transaction instanceof Tx ? transaction : new Tx(transaction);

    await tx.sign(privateKey);

    return `0x${tx.serialize().toString('hex')}`;
  }
}
