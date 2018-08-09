import web3 from 'web3';
export class Token {
  constructor({ address, decimals, logo, name, symbol }) {
    this.decimals = decimals;
    this.logo = logo;
    this.name = name;
    this.symbol = symbol;
    this.address = web3.utils.toChecksumAddress(address);
  }
}
