import web3 from 'web3';

// A wallet based on an Ethereum address string, to be used in place of
// ethereumjs-wallet when only the address is available
export class Address {
  constructor(addressString) {
    addressString = '0x' + addressString.replace(/^0x/, '');
    if (!web3.utils.isAddress(addressString)) {
      throw new Error('Not a valid Ethereum address');
    }
    this.address = web3.utils.hexToBytes(addressString);
    this._privKey = null;
    this._pubKey = null;
    this.privKey = null;
    this.pubKey = null;
  }

  getAddress() {
    return this.address;
  }

  getAddressString() {
    return web3.utils.bytesToHex(this.address);
  }

  async getBalance() {
    return await web3.eth.getBalance(this.getAddressString());
  }

  getChecksumAddressString() {
    return web3.utils.toChecksumAddress(this.getAddressString());
  }
}
