import { toBuffer } from 'ethereumjs-util';
import { decodeTx } from 'ethereum-tx-decoder';

/**
 * Converts transaction to rlp hash
 * @param {Tx} tx Transaction object
 * @returns {String} Transaction rlp hash
 */
export const convertTransactionToHash = tx =>
  `0x${tx.serialize().toString('hex')}`;

/**
 * Restores transaction from rlp hash
 * @param {String} rlpHash Rlp transaction hash
 * @returns {Object} Transaction object
 */
export const recoverTransaction = rlpHash => decodeTx(toBuffer(rlpHash));
