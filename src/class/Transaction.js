import web3 from 'web3';
import { BigNumber } from 'bignumber.js';
import erc20ABI from '@/abi/erc20.json';

const { numberToHex, toWei } = web3.utils;

export class Transaction {
  constructor({
    data,
    from,
    gasPrice = '90',
    gasLimit = '22000',
    hash,
    input,
    nonce,
    state = 'success',
    timestamp,
    to = '',
    networkId = 1,
    tokenInfo = undefined,
    transactionHash,
    value = '0',
    success,
  }) {
    if (tokenInfo) {
      this.tokenInfo = tokenInfo;
      this.valueWei = value;
    } else {
      this.value = value;
    }

    this.data = data || input;
    this.from = from;
    this.networkId = networkId;
    this.gasPrice = gasPrice;
    this.gasLimit = gasLimit;
    this.hash = hash || transactionHash;
    this.nonce = nonce;
    this.state = success === false ? 'error' : state;
    this.to = to;
    if (timestamp) {
      this.date = new Date(timestamp * 1000);
    }
  }
  set value(value) {
    this._value = String(value);
  }
  get value() {
    return this._value;
  }
  get valueWei() {
    if (!isNumeric(this._value)) return '0';

    let multiplier = BigNumber('10').pow(18);

    if (this.tokenInfo) {
      multiplier = BigNumber('10').pow(this.tokenInfo.decimals || 0);
    }

    return BigNumber(this._value)
      .times(multiplier)
      .toFixed(0);
  }
  set valueWei(valueWei) {
    if (!isNumeric(valueWei)) return '0';

    let multiplier = BigNumber('10').pow(18);

    if (this.tokenInfo) {
      multiplier = BigNumber('10').pow(this.tokenInfo.decimals || 0);
    }

    this._value = BigNumber(valueWei)
      .div(multiplier)
      .toFixed();
  }
  set gasPrice(price) {
    this._gasPrice = price.toString();
  }
  get gasPrice() {
    return this._gasPrice;
  }
  set to(to) {
    this._to = web3.utils.isAddress(to) ? web3.utils.toChecksumAddress(to) : to;
  }
  get to() {
    return this._to;
  }
  set from(from) {
    this._from = web3.utils.isAddress(from)
      ? web3.utils.toChecksumAddress(from)
      : from;
  }
  get from() {
    return this._from;
  }
  get gasPriceWei() {
    if (!isNumeric(this.gasPrice)) return '0';

    return toWei(this.gasPrice, 'Gwei');
  }
  set gasLimit(limit) {
    this._gasLimit = limit;
  }
  get gasLimit() {
    return this._gasLimit;
  }
  get validTo() {
    let { to } = this;

    if (to && to.toUpperCase().indexOf('0X') !== 0) {
      to = `0x${to}`;
    }

    return to || undefined;
  }
  get gasCost() {
    return BigNumber(this.gasPriceWei).times(this.gasLimit);
  }
  get token() {
    const token = this.tokenInfo && this.tokenInfo.symbol;
    return token || 'ETH';
  }
  getValidData(eth) {
    let { data } = this;

    if (this.tokenInfo) {
      const contract = new eth.Contract(erc20ABI, this.tokenInfo.address, {
        from: this.from,
      });

      data = contract.methods.transfer(this.validTo, this.valueWei).encodeABI();
    }

    return data;
  }
  async getFullPrice(eth) {
    const estimation = await this.estimateGas(eth);

    return BigNumber(this.gasPriceWei)
      .times(estimation)
      .toFixed();
  }
  async estimateGas(eth) {
    const estimationParams = {
      data: this.getValidData(eth),
      to: this.validTo,
    };

    return await eth.estimateGas(estimationParams);
  }
  getApiObject(eth) {
    this.data = this.getValidData(eth);
    let tnxData = {
      from: this.from,
      to: this.validTo,
      gasPrice: numberToHex(this.gasPriceWei),
      value: numberToHex(this.valueWei),
      gasLimit: numberToHex(this.gasLimit || 0),
      data: this.data,
      nonce: numberToHex(this.nonce),
    };

    if (this.tokenInfo) {
      tnxData = {
        ...tnxData,
        to: this.tokenInfo.address,
        value: '0x0',
      };
    }

    return tnxData;
  }
  getUpGasPrice() {
    return BigNumber(this.gasPrice)
      .plus('10')
      .integerValue(BigNumber.ROUND_CEIL);
  }
  clone() {
    let tnxData = {
      from: this.from,
      to: this.validTo,
      gasPrice: this.gasPrice,
      value: this.value,
      gasLimit: this.gasLimit,
      data: this.data,
      nonce: this.nonce,
      networkId: this.networkId,
      hash: this.hash,
    };

    if (this.tokenInfo) {
      tnxData = {
        ...tnxData,
        tokenInfo: this.tokenInfo,
        to: this.validTo,
        value: this.valueWei,
      };
    }

    return new Transaction(tnxData);
  }
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
