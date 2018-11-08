import web3 from 'web3';

const { toChecksumAddress } = web3.utils;

export default class Token {
  constructor({ address, decimals, logo, name, symbol, balance }) {
    if (!address) {
      throw new Error("Token can't be created without address!");
    }

    this.decimals = parseInt(decimals, 10) || 18;
    this.logo = logo;
    this.name = name;
    this.symbol = symbol ? symbol.toUpperCase() : undefined;
    this.address = toChecksumAddress(address);
    this.balance = balance || '0';
  }

  static getConsistent(token) {
    return {
      ...token,
      address: token.address.toLowerCase(),
    };
  }
}
