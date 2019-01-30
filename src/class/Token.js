import web3 from 'web3';

const { toChecksumAddress } = web3.utils;

export default class Token {
  static asObject({ address, decimals, logo, name, symbol, balance }) {
    if (!address) {
      throw new Error("Token can't be created without address!");
    }
    return {
      decimals: parseInt(decimals, 10) || 18,
      logo,
      name,
      symbol: symbol && symbol.toUpperCase(),
      address: toChecksumAddress(address),
      balance: balance || '0',
    };
  }

  static getConsistent(token) {
    return {
      ...token,
      address: token.address.toLowerCase(),
    };
  }
}
