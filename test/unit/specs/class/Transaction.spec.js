import { Transaction } from '@/class';
import { BigNumber } from 'bignumber.js';
import web3 from 'web3';

const apiResponse = {
  from: '0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b',
  hash: '0x902aa048c9fee4cc01f0533457009cdce6a172ea9eee5005617ae4ca3fc5fd04',
  input: '0x',
  success: true,
  timestamp: 1525898092,
  to: '0x7c59542b20002ed255598172cab48b86d865dfbb',
  value: 0.00000915,
};

const apiTokenResponse = {
  from: '0x4bd5c3e7e4d6b3df23e9da5b42e5e4daa3d2579b',
  timestamp: 1525898092,
  to: '0x7c59542b20002ed255598172cab48b86d865dfbb',
  tokenInfo: {
    address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
    name: '0x Protocol Token',
    decimals: 18,
  },
  address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
  decimals: 18,
  ethTransfersCount: 31,
  holdersCount: 61363,
  issuancesCount: 0,
  lastUpdated: 1529628787,
  name: '0x Protocol Token',
  owner: '0x',
  price: {
    rate: '0.847344',
    diff: -3.57,
    diff7d: -9.47,
    ts: '1529629464',
    marketCapUsd: '450543468.0',
  },
  symbol: 'ZRX',
  totalSupply: '1000000000000000000000000000',
  transfersCount: 449735,
  txsCount: 370623,
  transactionHash:
    '0xf7c725deba56e300787afcf569c3a6d04e7eb7a71861328ea35e86cd0acb8189',
  type: 'transfer',
  value: '22245335081606680213',
};

describe('Transaction Class', () => {
  it('creates transaction with API format', () => {
    const transaction = new Transaction(apiResponse);
    expect(transaction.value).toBe(apiResponse.value.toString());
    expect(transaction.valueWei).toBe(
      (apiResponse.value * Math.pow(10, 18)).toString(),
    );
    expect(transaction.from).toBe(
      web3.utils.toChecksumAddress(apiResponse.from),
    );
    expect(transaction.to).toBe(web3.utils.toChecksumAddress(apiResponse.to));
    expect(transaction.data).toBe(apiResponse.input);
    expect(transaction.date.getFullYear()).toBe(2018);
    expect(transaction.state).toBe('success');
  });

  it('creates transaction with token API format', () => {
    const transaction = new Transaction(apiTokenResponse);
    let _valueBN = new BigNumber('22245335081606680213');
    let valueBN = _valueBN.div(new BigNumber('10').pow(18));
    expect(transaction.value).toBe(valueBN.toString());
    expect(transaction.valueWei).toBe(_valueBN.toString());
    expect(transaction.from).toBe(
      web3.utils.toChecksumAddress(apiTokenResponse.from),
    );
    expect(transaction.to).toBe(
      web3.utils.toChecksumAddress(apiTokenResponse.to),
    );
    expect(transaction.data).toBe(apiTokenResponse.input);
    expect(transaction.date.getFullYear()).toBe(2018);
    expect(transaction.state).toBe('success');
  });
});
