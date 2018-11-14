import { transaction } from 'fixtures/transactions';

export const commonRequest = {
  method: 'foo',
  params: ['bar', 'baz'],
  jsonrpc: '2.0',
};

export const transactionRequest = {
  method: 'eth_sendTransaction',
  params: ['bar', 'baz'],
  jsonrpc: '2.0',
  transaction,
};

export const commonRequestSignResult =
  '0xd8d5809a2223a1ced2cb76064a5e1d3b08053dbad88dbbb09096d090364c5bbb64d3536e80c5f4bab16528fcb8020705ea5d53ff893621bce81635684dc3a6511c';
