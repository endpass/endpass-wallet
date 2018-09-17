import Web3 from 'web3';
import erc20ABI from '@/abi/erc20.json';
import { Token } from '@/class';

// Service for functions related to ERC20 tokens
export class ERC20Token {
  // Accepts a web.js instance and the address of the token contract
  constructor(address) {
    this.address = address;

    this._contract = null;
    this._token = null;
  }

  // Returns the web3.Contract instance for this token
  getContract() {
    if (!this._contract) {
      this._contract = new Web3.eth.Contract(erc20ABI, this.address);
    }
    return this._contract;
  }

  // Returns the balance of this token at an address in wei
  async getBalance(address) {
    let contract = this.getContract();
    return contract.methods.balanceOf(address).call();
  }

  // Returns information about the token: name, symbol, decimals, totalSupply
  async getInfo() {
    const tokenInfo = {};
    let contract = this.getContract();
    const methods = ['name', 'decimals', 'symbol', 'totalSupply'].map(
      async item => {
        try {
          tokenInfo[item] = await contract.methods[item]().call();
        } catch (e) {
          tokenInfo[item] = undefined;
        }
      },
    );
    await Promise.all(methods);
    return tokenInfo;
  }

  // Returns a Token class object by fetching ERC20 token info from the blockchain
  async getToken() {
    // Return cached token info if it has been set
    if (this._token && this._token.symbol && this._token.decimals) {
      return this._token;
    }

    let tokenInfo = await this.getInfo();

    this._token = new Token({
      address: this.address,
      ...tokenInfo,
    });

    return this._token;
  }
}
