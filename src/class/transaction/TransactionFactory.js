import { Transaction, web3 } from '@/class/internal';

import Transaction from './Transaction';

const { hexToNumber, hexToNumberString, fromWei } = web3.utils;

export default class TransactionFactory {
  static fromSendForm(trx) {
    const value = trx.tokenInfo ? Transaction.getValueFromWei(trx) : trx.value;
    return Transaction.create({ ...trx, value });
  }

  static fromBlock(trx) {
    const { gasPrice, nonce, chainId, networkId } = trx;

    const adaptData = {
      networkId: chainId ? hexToNumber(chainId) : networkId,
      value: Transaction.getValueFromWei(trx),
      timestamp: new Date().getTime() / 1000,
      nonce: String(nonce),
      gasPrice: fromWei(gasPrice, 'Gwei'),
    };

    return Transaction.create({ ...trx, ...adaptData });
  }

  static fromRequestParams(trx) {
    const { value, gasPrice, gas } = trx;
    const adaptData = {};
    if (value) {
      adaptData.value = fromWei(hexToNumberString(value));
    }
    if (gasPrice) {
      adaptData.gasPrice = fromWei(hexToNumberString(gasPrice), 'Gwei');
    }
    if (gas) {
      adaptData.gasLimit = hexToNumberString(gas);
    }

    return Transaction.create({ ...trx, ...adaptData });
  }
}
