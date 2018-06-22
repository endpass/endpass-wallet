import web3 from 'web3'
import { BigNumber } from 'bignumber.js';
import erc20ABI from '@/erc20.json';

export class Transaction {
  constructor(transaction) {
    this.tokenInfo = transaction.tokenInfo;
    if(this.tokenInfo) {
      this._value = transaction.value
    } else {
      this.value = transaction.value;
    }
    this.gasPrice = transaction.gasPrice;
    this.gasLimit = transaction.gasLimit;
    this.to = transaction.to;
    this.from = transaction.from;
    this.nonce = transaction.nonce;
    this.hash = transaction.hash || transaction.transactionHash;
    this.data = transaction.data || transaction.input;
    if(transaction.timestamp) {
      this.date = new Date(transaction.timestamp*1000);
    }
    this.state = transaction.state || 'success'
  }
  set value(value) {
    if(!isNumeric(value))
      return this._value = '0';
    if(this.tokenInfo) {
      let valueBN = new BigNumber(value);
      let multiplyer = new BigNumber(this.tokenInfo.decimals).pow('10');
      this._value = valueBN.times(multiplyer).toString();
    } else {
      this._value = web3.utils.toWei(value.toString());
    }
  }
  get value() {
    if(this.tokenInfo) {
      let valueBN = new BigNumber(this._value);
      let divider = new BigNumber('10').pow(this.tokenInfo.decimals);
      return valueBN.div(divider).toString();
    } else {
      return web3.utils.fromWei(this._value);
    }
  }
  set gasPrice(price) {
    if(!isNumeric(price))
      return this._gasPrice = '0';
    this._gasPrice = web3.utils.toWei(price.toString(), 'Gwei');
  }
  get gasPrice() {
    return web3.utils.fromWei(this._gasPrice, 'Gwei');
  }
  set gasLimit(limit) {
    if(!isNumeric(limit))
      return this._gasLimit = '0';
    this._gasLimit = limit.toString()
  }
  get gasLimit() {
    return this._gasLimit;
  }
  async getFullPrice(eth) {
    if (!this.tokenInfo) {
      const estimation = await this.estimateGas(eth);
      const gasPriceBN = BigNumber(this._gasPrice || '0');
      return gasPriceBN.times(estimation).toString();
    } else {
      return this.tokenInfo.balance;
    }
  }
  async estimateGas(eth) {
    let estimationParams = {
      data: this.data
    };
    if(this.to) {
      estimationParams.to = this.to
    }
    return await eth.estimateGas(estimationParams);
  }
  getApiObject(eth) {
    if(this.tokenInfo) {
      let contract = new eth.Contract(erc20ABI, this.tokenInfo.address, {
        from: this.from,
      });
      return {
        from: this.from,
        to: this.tokenInfo.address,
        gasPrice: web3.utils.numberToHex(this._gasPrice),
        value: '0x0',
        gasLimit: web3.utils.numberToHex(this.gas),
        data: contract.methods.transfer(this.to, this._value).encodeABI(),
        nonce: web3.utils.numberToHex(this.nonce)
      }
    } else {
      return {
        from: this.from,
        to: this.to,
        gasPrice: web3.utils.numberToHex(this._gasPrice),
        value: web3.utils.numberToHex(this._value),
        gasLimit: web3.utils.numberToHex(this.gasLimit),
        data: this.data,
        nonce: web3.utils.numberToHex(this.nonce)
      }
    }
  }
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
