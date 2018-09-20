import web3 from 'web3';

const address = Uint8Array.from([
  76,
  226,
  16,
  159,
  141,
  177,
  25,
  12,
  212,
  75,
  198,
  85,
  78,
  53,
  100,
  34,
  20,
  251,
  225,
  68,
]);

class AddressMock {
  getAddress() {
    return address;
  }

  getAddressString() {
    return web3.utils.bytesToHex(address);
  }

  async getBalance() {
    return await web3.eth.getBalance(this.getAddressString());
  }

  getChecksumAddressString() {
    return web3.utils.toChecksumAddress(this.getAddressString());
  }
}

export default new AddressMock();
