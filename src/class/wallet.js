import EthWallet from 'ethereumjs-wallet';

export class Wallet {
  constructor(v3) {
    this.getPrivateKey = function(password) {
      return EthWallet.fromV3(v3, password, true).getPrivateKey();
    };
    this.getPrivateKeyString = function(password) {
      return EthWallet.fromV3(v3, password, true).getPrivateKeyString();
    };
    this.exportToJSON = function (password, exportedV3Password) {
      return EthWallet.fromV3(v3, password, true).toV3String(exportedV3Password);
    };
    this.getAddressString = function() {
      return v3.address;
    };
    this.getJson = function() {
      return v3;
    };
  }
  signTransaction(transaction, password) {
    return transaction.sign(this.getPrivateKey(password));
  }
}
