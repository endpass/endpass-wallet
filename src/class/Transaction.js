import { ERC20Token, Token } from '@/class';
import { isNumeric } from '@/utils/numbers';
import web3 from '@/utils/web3';
import { BigNumber } from 'bignumber.js';

export default class Transaction {
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
      this.tokenInfo = new Token(tokenInfo);
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

    return web3.utils.toWei(this.gasPrice, 'Gwei');
  }

  set gasLimit(limit) {
    this._gasLimit = limit;
  }

  get gasLimit() {
    return this._gasLimit;
  }

  get validTo() {
    const { to } = this;

    if (!to) {
      return undefined;
    }

    if (/^0x/i.test(to)) {
      return to;
    }

    return `0x${to}`;
  }

  get gasCost() {
    return BigNumber(this.gasPriceWei).times(this.gasLimit);
  }

  get token() {
    const token = this.tokenInfo && this.tokenInfo.symbol;
    return token || 'ETH';
  }

  getValidData() {
    let { data } = this;

    if (this.tokenInfo) {
      const erc20 = new ERC20Token(this.tokenInfo.address);
      const contract = erc20.getContract();

      data = contract.methods.transfer(this.validTo, this.valueWei).encodeABI();
    }

    return data;
  }

  async getFullPrice() {
    const estimation = await this.estimateGas();

    return BigNumber(this.gasPriceWei)
      .times(estimation)
      .toFixed();
  }

  async estimateGas() {
    const estimationParams = {
      data: this.getValidData(),
      to: this.validTo,
    };
    const estimatedGas = await web3.eth.estimateGas(estimationParams);

    return estimatedGas;
  }

  getApiObject() {
    this.data = this.getValidData();
    let tnxData = {
      from: this.from,
      to: this.validTo,
      gasPrice: web3.eth.numberToHex(this.gasPriceWei),
      value: web3.eth.numberToHex(this.valueWei),
      gasLimit: web3.eth.numberToHex(this.gasLimit || 0),
      data: this.data,
      nonce: web3.eth.numberToHex(this.nonce),
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

  static isEqual(trx1, trx2) {
    return (
      `${trx1.networkId}-${trx1.hash}` === `${trx2.networkId}-${trx2.hash}`
    );
  }
}
