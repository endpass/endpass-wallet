import Tx from 'ethereumjs-tx';
import {
  convertTransactionToHash,
  recoverTransaction,
} from '@/utils/transactions';
import { ethplorerTransactions } from 'fixtures/transactions';

describe('convertTransactionToHash', () => {
  it('should convert transaction to rlp hash', () => {
    const ethplorerTx = new Tx(ethplorerTransactions[0]);

    expect(convertTransactionToHash(ethplorerTx)).toEqual(
      '0xdd80808094b41e54248facd542165a4fcb53fb980e4ac88db580801c8080',
    );
  });
});

describe('recoverTransaction', () => {
  it('should restore transaction from rlp hash', () => {
    const recoveredTransaction = recoverTransaction(
      '0xdd80808094b41e54248facd542165a4fcb53fb980e4ac88db580801c8080',
    );

    expect(recoveredTransaction).toBeInstanceOf(Object);
    expect(recoveredTransaction.to).toEqual(ethplorerTransactions[0].to);
  });
});
