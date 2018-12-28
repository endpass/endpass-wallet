import { get } from 'lodash';
import { Token, ERC20Token } from '@/class/internal';
import web3 from '@/class/singleton/web3';
import { isNumeric } from '@endpass/utils/numbers';
import { BigNumber } from 'bignumber.js';

const { toWei, numberToHex, isAddress, toChecksumAddress } = web3.utils;

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

  /**
   * Static methods
   */

  static async isTransactionToContract(transaction) {
    const res = await web3.eth.getCode(transaction.to);

    return res !== '0x';
  }

  static getValidTo(transaction) {
    const { to } = transaction;

    if (!to) {
      return undefined;
    }

    if (/^0x/i.test(to)) {
      return to;
    }

    return `0x${to}`;
  }

  static getValidData(transaction) {
    const { data, tokenInfo } = transaction;

    if (!transaction.tokenInfo) {
      return data;
    }

    const validTo = Transaction.getValidTo(transaction);
    const erc20 = new ERC20Token(tokenInfo.address);
    const contract = erc20.getContract();
    const transactionValueInWei = Transaction.getTransactonValueInWei(
      transaction,
    );

    return contract.methods
      .transfer(validTo, transactionValueInWei)
      .encodeABI();
  }

  static getPriceWei(transaction) {
    if (!isNumeric(transaction.gasPrice)) return '0';

    return toWei(transaction.gasPrice.toString(), 'Gwei');
  }

  static getTransactonValueInWei(transaction) {
    const { value, tokenInfo } = transaction;

    if (!isNumeric(value)) {
      return '0';
    }

    const multiplier = tokenInfo
      ? BigNumber('10').pow(tokenInfo.decimals || 0)
      : BigNumber('10').pow(18);

    return BigNumber(value)
      .times(multiplier)
      .toFixed(0);
  }

  static async getGasFullPrice(transaction) {
    const estimationParams = {
      data: Transaction.getValidData(transaction),
      to: Transaction.getValidTo(transaction),
    };
    const estimatedGas = await web3.eth.estimateGas(estimationParams);
    const gasPriceWei = Transaction.getPriceWei(transaction);

    return BigNumber(gasPriceWei)
      .times(estimatedGas)
      .toFixed();
  }

  /**
   * Instance methods and props
   */

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
    this._to = isAddress(to) ? toChecksumAddress(to) : to;
  }

  get to() {
    return this._to;
  }

  set from(from) {
    this._from = isAddress(from) ? toChecksumAddress(from) : from;
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
    return get(this, 'tokenInfo.symbol') || 'ETH';
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
      gasPrice: numberToHex(this.gasPriceWei),
      value: numberToHex(this.valueWei),
      gasLimit: numberToHex(this.gasLimit || 0),
      nonce: numberToHex(this.nonce),
      data: this.data,
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
