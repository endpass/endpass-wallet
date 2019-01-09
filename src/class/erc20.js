import web3 from '@/class/singleton/web3';
import erc20ABI from '@/abi/erc20.json';
import { Token } from '@/class';

// Service for functions related to ERC20 tokens
export default class ERC20Token {
  // Accepts a web.js instance and the address of the token contract
  constructor(address) {
    this.address = address;

    this.contract = null;
    this.token = null;
  }

  // Returns the balance of this token at an address in wei
  static getBalance(accountAddress, tokenAddress) {
    const contract = new web3.eth.Contract(erc20ABI, tokenAddress);

    return contract.methods.balanceOf(accountAddress).call();
  }

  // Returns the web3.Contract instance for this token
  getContract() {
    if (!this.contract) {
      this.contract = new web3.eth.Contract(erc20ABI, this.address);
    }
    return this.contract;
  }

  // Returns information about the token: name, symbol, decimals, totalSupply
  async getInfo() {
    const tokenInfo = {};
    const contract = this.getContract();
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
    if (this.token && this.token.symbol && this.token.decimals) {
      return this.token;
    }

    const tokenInfo = await this.getInfo();

    this.token = Token.asObject({
      address: this.address,
      ...tokenInfo,
    });

    return this.token;
  }
}
