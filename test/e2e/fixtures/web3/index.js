import { toWei } from 'web3-utils';
import addressInfo_b14ab from '../addressinfo/b14ab';
import addressInfo_31ea8 from '../addressinfo/31ea8';
import { address } from '../accounts';

const BLOCK_NUMBER = '0x4051fb';
const BLOCK_HASH =
  '0xa683f126f5c634b3b25cba9711056da65083d50a7fd7406fcf69c5d57da4845d';
const TRANSACTION_HASH =
  '0x631cf7bb186019649920b09a7d5394c206cfe8aec55b3c1e8f0cc876def942a7';
const CANCEL_TRANSACTION_HASH =
  '0x631cf7bb186019649920b09a7d5394c206cfe8aec55b3c1e8f0cc876def942a8';
const RESEND_TRANSACTION_HASH =
  '0x631cf7bb186019649920b09a7d5394c206cfe8aec55b3c1e8f0cc876def942a9';

export const syncing = {
  payload: {
    method: 'eth_syncing',
  },
  result: false,
};

export const blockNumber = {
  payload: {
    method: 'eth_blockNumber',
  },
  result: BLOCK_NUMBER,
};

export const getBlockByNumber = {
  payload: {
    method: 'eth_getBlockByNumber',
    params: [BLOCK_NUMBER, true],
  },
  result: {
    transactions: [],
  },
};

export const getBalance_b14ab = {
  payload: {
    method: 'eth_getBalance',
    params: [addressInfo_b14ab.address, 'latest'],
  },
  result: toWei(String(addressInfo_b14ab.ETH.balance), 'ether'),
};

export const getBalance_31ea8 = {
  payload: {
    method: 'eth_getBalance',
    params: [address, 'latest'],
  },
  result: toWei('1', 'ether'),
};

export const getBalance_6bbf1 = {
  payload: {
    method: 'eth_getBalance',
    params: ['0x6bbf1dea0d21eafd232e281a196e6f11906054df', 'latest'],
  },
  result: toWei('2', 'ether'),
};

export const getTransactionCount_b14ab = {
  payload: {
    method: 'eth_getTransactionCount',
    params: [addressInfo_b14ab.address, 'latest'],
  },
  result: addressInfo_b14ab.countTxs,
};

export const call_b14ab = {
  payload: {
    method: 'eth_call',
    params: [
      {
        data:
          '0x70a08231000000000000000000000000b14ab53e38da1c172f877dbc6d65e4a1b0474c3c',
        to: '0x4e84e9e5fb0a972628cf4568c403167ef1d40431',
      },
      'latest',
    ],
  },
  result: '0x0000000000000000000000000000000000000000000000000000000000000000',
};

export const call_31ea8 = {
  payload: {
    method: 'eth_call',
    params: [
      {
        data:
          '0x70a0823100000000000000000000000031ea8795ee32d782c8ff41a5c68dcbf0f5b27f6d',
        to: '0x4e84e9e5fb0a972628cf4568c403167ef1d40431',
      },
      'latest',
    ],
  },
  result: '0x0000000000000000000000000000000000000000000000000000000000000000',
};

export const call_custom_token_1 = {
  payload: {
    method: 'eth_call',
    params: [
      {
        data: '0x06fdde03',
        to: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
      },
      'latest',
    ],
  },
  result:
    '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000084f4d47546f6b656e000000000000000000000000000000000000000000000000',
};

export const call_custom_token_2 = {
  payload: {
    method: 'eth_call',
    params: [
      {
        data: '0x313ce567',
        to: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
      },
      'latest',
    ],
  },
  result: '0x0000000000000000000000000000000000000000000000000000000000000012',
};

export const call_custom_token_3 = {
  payload: {
    method: 'eth_call',
    params: [
      {
        data: '0x95d89b41',
        to: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
      },
      'latest',
    ],
  },
  result:
    '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000034f4d470000000000000000000000000000000000000000000000000000000000',
};

export const call_custom_token_4 = {
  payload: {
    method: 'eth_call',
    params: [
      {
        data: '0x18160ddd',
        to: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
      },
      'latest',
    ],
  },
  result: '0x00000000000000000000000000000000000000000074021e45de4e977a570f4f',
};

export const call_custom_token_5 = {
  payload: {
    method: 'eth_call',
    params: [
      {
        data:
          '0x70a08231000000000000000000000000b14ab53e38da1c172f877dbc6d65e4a1b0474c3c',
        to: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
      },
      'latest',
    ],
  },
  result: '0x0000000000000000000000000000000000000000000000000000000000000000',
};

export const estimateGas = {
  payload: {
    method: 'eth_estimateGas',
    params: [
      {
        data: '0x',
      },
    ],
  },
  result: '0xcf08',
};

export const estimateGas_31ea8 = {
  payload: {
    method: 'eth_estimateGas',
    params: [
      {
        data: '0x',
        to: addressInfo_31ea8.address,
      },
    ],
  },
  result: '0x5208',
};

export const sendRawTransaction_b14ab_31ea8 = {
  payload: {
    method: 'eth_sendRawTransaction',
    params: [
      '0xf86b8084b2d05e008255f09431ea8795ee32d782c8ff41a5c68dcbf0f5b27f6d880de0b6b3a76400008026a038747ccd542eb667b60e23157d72037406eb14ac2c86413d7595844c40c07acda06224896a2c6a02bd9eb4109375778f94d121c5f01e517052b343f0e826bca04a',
    ],
  },
  result: TRANSACTION_HASH,
};

export const getTransactionReceipt_b14ab_31ea8 = {
  payload: {
    method: 'eth_getTransactionReceipt',
    params: [TRANSACTION_HASH],
  },
  result: {
    transactionHash: TRANSACTION_HASH,
    transactionIndex: addressInfo_b14ab.countTxs,
    blockNumber: BLOCK_NUMBER,
    blockHash: BLOCK_HASH,
    cumulativeGasUsed: '0x33bc',
    gasUsed: '0x4dc',
    contractAddress: null,
    status: '0x1',
  },
};

export const sendRawTransaction_b14ab_31ea8_cancel = {
  payload: {
    method: 'eth_sendRawTransaction',
    params: [
      '0xf86480850306dc42008255f094b14ab53e38da1c172f877dbc6d65e4a1b0474c3c808025a08894aae36d7b6b67396a1e06919875a38093f73633a7febd826f079ecf8f1e9fa00740a8fe1c5f2e75495c0213fc78b1ec8cc5f0adb6977787b36259b33a27ed5a',
    ],
  },
  result: CANCEL_TRANSACTION_HASH,
};

export const getTransactionReceipt_b14ab_31ea8_cancel = {
  payload: {
    method: 'eth_getTransactionReceipt',
    params: [CANCEL_TRANSACTION_HASH],
  },
  result: {
    transactionHash: CANCEL_TRANSACTION_HASH,
    transactionIndex: addressInfo_b14ab.countTxs,
    blockNumber: BLOCK_NUMBER,
    blockHash: BLOCK_HASH,
    cumulativeGasUsed: '0x33bc',
    gasUsed: '0x4dc',
    contractAddress: null,
    status: '0x1',
  },
};

export const sendRawTransaction_b14ab_31ea8_resend = {
  payload: {
    method: 'eth_sendRawTransaction',
    params: [
      '0xf86b8084ee6b28008255f09431ea8795ee32d782c8ff41a5c68dcbf0f5b27f6d880de0b6b3a76400008026a06e3e887b76a9b27b0fefc3445daff90f618250e9501e80d382dc08f09de79366a0400cafa567d5023d99754fbfc57b62c83e64a0da02e143f485e7a6fb9cec4827',
    ],
  },
  result: RESEND_TRANSACTION_HASH,
};

export const getTransactionReceipt_b14ab_31ea8_resend = {
  payload: {
    method: 'eth_getTransactionReceipt',
    params: [RESEND_TRANSACTION_HASH],
  },
  result: {
    transactionHash: RESEND_TRANSACTION_HASH,
    transactionIndex: addressInfo_b14ab.countTxs,
    blockNumber: BLOCK_NUMBER,
    blockHash: BLOCK_HASH,
    cumulativeGasUsed: '0x33bc',
    gasUsed: '0x4dc',
    contractAddress: null,
    status: '0x1',
  },
};
