import ethUtil from 'ethereumjs-util';

// A wallet based on an Ethereum address string, to be used in place of
// ethereumjs-wallet when only the address is available
export class Address {
  constructor(addressString) {
    addressString = ethUtil.addHexPrefix(addressString);
    if (!ethUtil.isValidAddress(addressString)) {
      throw new Error("Not a valid Ethereum address");
    }
    this.address = ethUtil.toBuffer(addressString);
    this._privKey = null;
    this._pubKey = null;
    this.privKey = null;
    this.pubKey = null;
  }

  getAddress() {
    return this.address;
  }

  getAddressString() {
    return ethUtil.bufferToHex(this.address)
  }

  getChecksumAddressString() {
    return ethUtil.toChecksumAddress(this.getAddressString());
  }
}
