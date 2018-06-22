import web3 from 'web3'
import { BigNumber } from 'bignumber.js';
import erc20ABI from '@/erc20.json';

export default class {
  constructor(transaction) {
    this.tokenInfo = transaction.tokenInfo;
    if(this.tokenInfo) {
      this._value = transaction.value
    } else {
      this.value = transaction.value;
    }
    this.gasPrice = transaction.gasPrice;
    this.gas = transaction.gas;
    this.to = transaction.to;
    this.from = transaction.from;
    this.nonce = transaction.nonce;
    this.hash = transaction.hash;
    this.data = transaction.data || transaction.input;
    if(transaction.timestamp) {
      this.date = new Date(transaction.timestamp*1000);
    }
    this.state = transaction.state || 'success'
  }
  set value(value) {
    if(!isNumeric(value))
      return
    if(this.tokenInfo) {
      let valueBN = new BigNumber(value);
      let multiplyer = new BigNumber(this.tokenInfo.decimals).pow('10');
      this._value = valueBN.times(multiplyer).toString();
    } else {
      value = typeof value === 'number' ? value.toString() : value;
      this._value = web3.utils.toWei(value);
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
      return
    this._gasPrice = web3.utils.toWei(price, 'Gwei');
  }
  get gasPrice() {
    return web3.utils.fromWei(this._gasPrice, 'Gwei');
  }
  getFullPrice() {
    let trxEthValue = this.tokenInfo ? '0' : this.value;
    if(this.gasPrice && this.gas) {
      let valueBN = web3.utils.BN(trxEthValue);
      let gasBN = web3.utils.BN(this.gas);
      let gasPriceBN = web3.utils.BN(this.value);
      return fromWei(valueBN.add(gasBN.mul(gasPriceBN)));
    } else {
      return trxEthValue
    }
  }
  getApiObject(nonce) {
    if(this.tokenInfo) {
      let contract = new web3.eth.Contract(erc20ABI, this.tokenInfo.address, {
        from: this.from,
      });
      return {
        from: this.from,
        to: this.tokenInfo.address,
        gasPrice: web3.utils.numberToHex(this._gasPrice),
        value: '0x0',
        gasLimit: web3.utils.numberToHex(this.gas),
        data: contract.transfer(this.to, this._value).encodeABI(),
        nonce
      }
    } else {
      return {
        from: this.from,
        to: this.to,
        gasPrice: web3.utils.numberToHex(this._gasPrice),
        value: web3.utils.numberToHex(this._value),
        gasLimit: web3.utils.numberToHex(this.gas),
        data: this.data,
        nonce
      }
    }
  }
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
