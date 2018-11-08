import { Transaction } from '@/class';
import { BigNumber } from 'bignumber.js';
import web3 from 'web3';
import { transaction } from 'fixtures/transactions';

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
  describe('static methods', () => {
    describe('isTransactionToContract', () => {
      it('should returns true if resolved code not equals to 0x', async () => {
        const res = await Transaction.isTransactionToContract(transaction);

        expect(web3.eth.getCode).toBeCalledWith(transaction.to);
        expect(res).toBe(true);
      });

      it('should returns false if resolved code equals to 0x', async () => {
        web3.eth.getCode.mockResolvedValueOnce('0x');

        const res = await Transaction.isTransactionToContract(transaction);

        expect(web3.eth.getCode).toBeCalledWith(transaction.to);
        expect(res).toBe(false);
      });
    });

    describe('getValidTo', () => {
      it('should returns correct data in all cases', () => {
        expect(Transaction.getValidTo({ to: null })).toBe(undefined);
        expect(Transaction.getValidTo({ to: '0x0123' })).toBe('0x0123');
        expect(Transaction.getValidTo({ to: '0123' })).toBe('0x0123');
      });
    });

    describe('getPriceWei', () => {
      it('should returns transaction gas price in gwei', () => {
        expect(Transaction.getPriceWei({ gasPrice: '1' })).toBe('1000000000');
      });

      it('should process number literals', () => {
        expect(Transaction.getPriceWei({ gasPrice: '1' })).toBe('1000000000');
        expect(Transaction.getPriceWei({ gasPrice: 1 })).toBe('1000000000');
      });

      it('should returns 0 if transaction gas price is not numeric', () => {
        expect(Transaction.getPriceWei({ gasPrice: null })).toBe('0');
        expect(Transaction.getPriceWei({ gasPrice: undefined })).toBe('0');
        expect(Transaction.getPriceWei({ gasPrice: 'foo' })).toBe('0');
      });
    });

    describe('getTransactonValueInWei', () => {
      it('should returns transaction value in wei', () => {
        expect(Transaction.getTransactonValueInWei({ value: 10 })).toBe(
          '10000000000000000000',
        );
      });

      it('should returns 0 if transaction value is not numberic', () => {
        expect(Transaction.getTransactonValueInWei({ value: 'foo' })).toBe('0');
      });

      it('should returns transaction value by token decimals if it is present ', () => {
        expect(
          Transaction.getTransactonValueInWei({
            value: 10,
            tokenInfo: { decimals: 2 },
          }),
        ).toBe('1000');
      });

      it('should returns transaction value as is if token is not present ', () => {
        expect(
          Transaction.getTransactonValueInWei({
            value: 10,
            tokenInfo: { decimals: null },
          }),
        ).toBe('10');
      });
    });

    describe('getValidData', () => {
      it('should return transaction data if token is not present', () => {
        expect(Transaction.getValidData({ data: 'foo' })).toBe('foo');
      });
    });

    describe('getGasFullPrice', () => {
      it('should estimate gas and returns fixed fee', async () => {
        web3.eth.estimateGas.mockResolvedValueOnce('21000');

        const transactionData = {
          ...transaction,
          gasPrice: '10',
          to: '0x0123',
        };
        const fullPrice = await Transaction.getGasFullPrice(transactionData);

        expect(web3.eth.estimateGas).toBeCalledWith({
          data: '0x',
          to: '0x0123',
        });
        expect(fullPrice).toBe('210000000000000');
      });
    });
  });

  describe('instance methods', () => {
    it('creates transaction with API format', () => {
      const tx = new Transaction(apiResponse);
      expect(tx.value).toBe(apiResponse.value.toString());
      expect(tx.valueWei).toBe(
        (apiResponse.value * Math.pow(10, 18)).toString(),
      );
      expect(tx.from).toBe(web3.utils.toChecksumAddress(apiResponse.from));
      expect(tx.to).toBe(web3.utils.toChecksumAddress(apiResponse.to));
      expect(tx.data).toBe(apiResponse.input);
      expect(tx.date.getFullYear()).toBe(2018);
      expect(tx.state).toBe('success');
    });

    it('creates transaction with token API format', () => {
      const tx = new Transaction(apiTokenResponse);
      const _valueBN = new BigNumber('22245335081606680213');
      const valueBN = _valueBN.div(new BigNumber('10').pow(18));
      expect(tx.value).toBe(valueBN.toString());
      expect(tx.valueWei).toBe(_valueBN.toString());
      expect(tx.from).toBe(web3.utils.toChecksumAddress(apiTokenResponse.from));
      expect(tx.to).toBe(web3.utils.toChecksumAddress(apiTokenResponse.to));
      expect(tx.data).toBe(apiTokenResponse.input);
      expect(tx.date.getFullYear()).toBe(2018);
      expect(tx.state).toBe('success');
    });
  });
});
