import EthWallet from 'ethereumjs-wallet';

export class Wallet {
  constructor(v3) {
    this.getPrivateKey = function(password) {
      return EthWallet.fromV3(v3, password, true).getPrivateKey();
    };
    this.exportToJSON = function () {
      return v3
    };
    this.getAddressString = function() {
      return v3.address;
    };
  }
  signTransaction(transaction, password) {
    return transaction.sign(this.getPrivateKey(password));
  }
}
