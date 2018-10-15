import Web3 from 'web3';

import addressInfo_b14ab from '../addressinfo/b14ab';
import addressInfo_31ea8 from '../addressinfo/31ea8';

const BLOCK_NUMBER = '0x4051fb';
const BLOCK_HASH =
  '0xa683f126f5c634b3b25cba9711056da65083d50a7fd7406fcf69c5d57da4845d';
const TRANSACTION_HASH =
  '0x631cf7bb186019649920b09a7d5394c206cfe8aec55b3c1e8f0cc876def942a7';

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

export const getBalance_b14ab = {
  payload: {
    method: 'eth_getBalance',
    params: [addressInfo_b14ab.address, 'latest'],
  },
  result: Web3.utils.toWei(String(addressInfo_b14ab.ETH.balance), 'ether'),
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

export const estimateGas_b14ab_31ea8 = {
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
    // The signed transaction data may change. It is necessary to mock the gas price request.
    params: [
      '0xf86b8084ee6b28008255f09431ea8795ee32d782c8ff41a5c68dcbf0f5b27f6d880de0b6b3a7640000801ca014903d34ec6a387615754dcc1499c1b55dd6cac758fd0ba03f0ff9b2a2dac55aa01105f222598f64ec471f460072cb3f8c5afef010cfcfd8196e4ea1a700b61c25',
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
