<<<<<<< HEAD
import { cloneDeep, get } from 'lodash';
import { BigNumber } from 'bignumber.js';
import { isNumeric } from '@endpass/utils/numbers';
import { ERC20Token } from '@/class';
import web3 from '@/class/singleton/web3';

import applyProps from './applyProps';

const { toWei, numberToHex, isAddress } = web3.utils;
=======
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { BigNumber } from 'bignumber.js';
import { isNumeric } from '@endpass/utils/numbers';
import { toWei, numberToHex, isAddress } from 'web3-utils';
import { ERC20Token } from '../internal';

import applyProps from './applyProps';
import injectWeb3 from '../injectWeb3';

let web3;
>>>>>>> refactor: Step first. Move EventEmitter to core/class

const DEFAULT_ZERO = '0';

export default class Transaction {
<<<<<<< HEAD
=======
  static set web3(val) {
    web3 = val;
  }

>>>>>>> refactor: Step first. Move EventEmitter to core/class
  static create({
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
    value = DEFAULT_ZERO,
    success,
  }) {
    // prepare external structure
    const trx = {
      tokenInfo,
      from,
      to,
      networkId,
      gasPrice,
      gasLimit,
      nonce,
      // dependency from other props
      data: data || input,
      hash: hash || transactionHash,
      state: success === false ? 'error' : state,
      date: timestamp && new Date(timestamp * 1000),
      // calculated
      value: DEFAULT_ZERO,
    };

    applyProps(trx, {
      value,
      from,
      gasPrice,
      gasLimit,
      to,
    });

    return trx;
  }

  static applyProps(trx, newProps) {
<<<<<<< HEAD
    const res = Transaction.unfreeze(trx);
=======
    const res = { ...trx }; // unfreeze
>>>>>>> refactor: Step first. Move EventEmitter to core/class
    applyProps(res, newProps);
    return res;
  }

<<<<<<< HEAD
  static unfreeze(trx) {
    return { ...trx };
  }

=======
>>>>>>> refactor: Step first. Move EventEmitter to core/class
  static clone(trx) {
    return cloneDeep(trx);
  }

  static isEqual(trx1, trx2) {
    return (
      `${trx1.networkId}-${trx1.hash}` === `${trx2.networkId}-${trx2.hash}`
    );
  }

  static async isToContract(transaction) {
    const res = await web3.eth.getCode(transaction.to);

    return res !== '0x';
  }

  static getMultiplier(tokenInfo) {
    const decimals = tokenInfo ? tokenInfo.decimals || 0 : 18;
    return BigNumber('10').pow(decimals);
  }

  static getTokenSymbol(trx) {
    const { tokenInfo } = trx;
    return get(tokenInfo, 'symbol', 'ETH');
  }

  static getGasCost({ gasLimit, gasPrice }) {
    const gasPriceWei = Transaction.getGasPriceWei(gasPrice);
    return BigNumber(gasPriceWei).times(gasLimit);
  }

  static getUpGasCost(trx) {
    const { token } = trx;
    const gasCost = Transaction.getGasCost(trx);

    const tnxValue =
      token === 'ETH' ? Transaction.getValueInWei(trx) : DEFAULT_ZERO;

    return BigNumber(gasCost).plus(tnxValue);
  }

  static getUpGasPrice({ gasPrice }) {
    return BigNumber(gasPrice)
      .plus('10')
      .integerValue(BigNumber.ROUND_CEIL);
  }

  static getGasPriceWei(price) {
    const value = price && price.toString();
    return !isNumeric(value) ? DEFAULT_ZERO : toWei(value, 'Gwei');
  }

  static getValidTo(transaction) {
    const { to } = transaction;

    if (!to) {
      return undefined;
    }

    if (isAddress(to)) {
      return to;
    }

    return `0x${to}`;
  }

  static getValidData(transaction) {
    const { data, tokenInfo } = transaction;
    if (!tokenInfo) {
      return data;
    }

    const validTo = Transaction.getValidTo(transaction);
    const erc20 = new ERC20Token(tokenInfo.address);
    const contract = erc20.getContract();
    const transactionValueInWei = Transaction.getValueInWei(transaction);
    return contract.methods
      .transfer(validTo, transactionValueInWei)
      .encodeABI();
  }

  static getPriceWei(transaction) {
    return Transaction.getGasPriceWei(transaction.gasPrice);
  }

  static getValueBN(transaction) {
    const { value } = transaction;

    if (!isNumeric(value)) {
      return BigNumber(DEFAULT_ZERO);
    }

    return BigNumber(value);
  }

  static getValueInWei(transaction) {
    const multiplier = Transaction.getMultiplier(transaction.tokenInfo);
    return Transaction.getValueBN(transaction)
      .times(multiplier)
      .toFixed(0);
  }

  static getValueFromWei(transaction) {
    const multiplier = Transaction.getMultiplier(transaction.tokenInfo);
    return Transaction.getValueBN(transaction)
      .div(multiplier)
      .toFixed();
  }

  static async getGasFullPrice(transaction) {
<<<<<<< HEAD
    const estimationParams = {
      data: Transaction.getValidData(transaction),
      to: Transaction.getValidTo(transaction),
    };
    const estimatedGas = await web3.eth.estimateGas(estimationParams);
=======
    const estimatedGas = await web3.eth.estimateGas({
      data: Transaction.getValidData(transaction),
      to: Transaction.getValidTo(transaction),
    });
>>>>>>> refactor: Step first. Move EventEmitter to core/class
    const gasPriceWei = Transaction.getPriceWei(transaction);

    return BigNumber(gasPriceWei)
      .times(estimatedGas)
      .toFixed();
  }

  static getApiObject(trx) {
    const data = Transaction.getValidData(trx);
    const validTo = Transaction.getValidTo(trx);
    const gasPriceWei = Transaction.getPriceWei(trx);
    const valueWei = Transaction.getValueInWei(trx);
    const { tokenInfo } = trx;

    const tokenPassData = tokenInfo
      ? {
          to: tokenInfo.address,
          value: '0x0',
        }
      : {};

    return {
      from: trx.from,
      to: validTo,
      gasPrice: numberToHex(gasPriceWei),
      value: numberToHex(valueWei),
      gasLimit: numberToHex(trx.gasLimit || 0),
      nonce: numberToHex(trx.nonce),
      data,
      ...tokenPassData,
    };
  }
<<<<<<< HEAD

  static async getFullPrice(trx) {
    const estimation = await Transaction.estimateGas(trx);
    const gasPriceWei = Transaction.getPriceWei(trx);

    return BigNumber(gasPriceWei)
      .times(estimation)
      .toFixed();
  }

  static async estimateGas(trx) {
    const validTo = Transaction.getValidTo(trx);
    const estimationParams = {
      data: Transaction.getValidData(trx),
      to: validTo,
    };
    const estimatedGas = await web3.eth.estimateGas(estimationParams);

    return estimatedGas;
  }
}
=======
}

const createTransactionClass = injectWeb3(Transaction);

export { createTransactionClass };
>>>>>>> refactor: Step first. Move EventEmitter to core/class
