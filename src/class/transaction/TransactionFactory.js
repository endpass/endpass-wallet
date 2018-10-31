import { BigNumber } from 'bignumber.js';
import { Transaction } from '@/class';

export default class TransactionFactory {
  static fromSendForm(trx) {
    return new Transaction(trx);
  }

  static fromBlock(trx) {
    const { value: valueWei, gasPrice, nonce } = trx;
    const adaptTrx = new Transaction(trx);
    const gweiMultiplier = BigNumber('10').pow(9);

    adaptTrx.valueWei = valueWei;
    adaptTrx.date = new Date();
    adaptTrx.nonce = String(nonce);
    adaptTrx.gasPrice = BigNumber(gasPrice)
      .div(gweiMultiplier)
      .toFixed();

    return adaptTrx;
  }
}
