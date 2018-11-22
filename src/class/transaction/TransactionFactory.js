import { Transaction } from '@/class';
import web3 from '@/utils/web3';

const { hexToNumber, fromWei } = web3.utils;

export default class TransactionFactory {
  static fromSendForm(trx) {
    return new Transaction(trx);
  }

  static fromBlock(trx) {
    const { value: valueWei, gasPrice, nonce, chainId, networkId } = trx;

    const adaptData = {
      networkId: chainId ? hexToNumber(chainId) : networkId,
      valueWei,
      date: new Date(),
      nonce: String(nonce),
      gasPrice: fromWei(gasPrice, 'Gwei'),
    };

    return Object.assign(new Transaction(trx), adaptData);
  }
}
