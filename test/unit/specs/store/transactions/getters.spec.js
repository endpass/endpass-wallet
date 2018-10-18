import state from '@/store/transactions';

import {
  ethplorerTransactions,
  pendingTransactions,
} from 'fixtures/transactions';
import { checksumAddress } from 'fixtures/accounts';

describe('transactions getters', () => {
  let stateInstance;

  beforeEach(() => {
    stateInstance = {
      pendingTransactions: [],
      transactionHistory: [],
    };
  });

  describe('accountTransactions', () => {
    it('should get account transactions correctly', () => {
      stateInstance.pendingTransactions = pendingTransactions;

      const transactions = state.getters.accountTransactions(
        stateInstance,
        {},
        {
          accounts: {
            address: {
              getChecksumAddressString() {
                return checksumAddress;
              },
            },
          },
          web3: {
            activeNet: { id: 2 },
          },
        },
      );

      expect(transactions).toHaveLength(3);
      expect(transactions).toContainEqual(stateInstance.pendingTransactions[0]);
    });

    it('should return an empty array with a nullable address', () => {
      stateInstance.pendingTransactions = [
        {
          to: '0x0',
          state: 'success',
        },
      ];

      const transactions = state.getters.accountTransactions(
        stateInstance,
        {},
        {
          accounts: {
            address: null,
          },
        },
      );

      expect(transactions).toEqual([]);
    });

    it('should concat transactions', () => {
      stateInstance = {
        pendingTransactions: [pendingTransactions[0]],
      };

      const transactions = state.getters.accountTransactions(
        stateInstance,
        {
          filteredHistoryTransactions: [pendingTransactions[3]],
        },
        {
          accounts: {
            address: {
              getChecksumAddressString() {
                return checksumAddress;
              },
            },
          },
          web3: {
            activeNet: { id: 1 },
          },
        },
      );

      expect(transactions).toHaveLength(2);
    });

    it('should sort transactions by date', () => {
      const trx1 = {
        to: '0x2ce2109f8db1190cd44bc6554e35642214fbe144',
        from: checksumAddress,
        date: new Date('01/01/2001'),
        hash: '1',
      };
      const trx2 = {
        to: '0x2ce2109f8db1190cd44bc6554e35642214fbe144',
        from: checksumAddress,
        date: new Date('01/01/2010'),
        hash: '2',
      };
      const trx3 = {
        to: '0x2ce2109f8db1190cd44bc6554e35642214fbe144',
        from: checksumAddress,
        hash: '3',
      };

      stateInstance = {
        pendingTransactions: [trx1, trx2, trx3],
      };

      const transactions = state.getters.accountTransactions(
        stateInstance,
        {},
        {
          accounts: {
            address: {
              getChecksumAddressString() {
                return checksumAddress;
              },
            },
          },
          web3: {
            activeNet: { id: 2 },
          },
        },
      );

      expect(transactions).toStrictEqual([trx3, trx2, trx1]);
    });

    it('should not return duplicate transactions with equal hash', () => {
      const trx1 = {
        to: '0x2ce2109f8db1190cd44bc6554e35642214fbe144',
        from: checksumAddress,
        hash: '0x2ce2109f8db1190cd44bc6554e35642214fbe144',
      };
      const trx2 = {
        to: '0x2ce2109f8db1190cd44bc6554e35642214fbe144',
        from: checksumAddress,
        hash: '0x2ce2109f8db1190cd44bc6554e35642214fbe144',
      };

      stateInstance = {
        pendingTransactions: [trx1, trx2],
      };

      const transactions = state.getters.accountTransactions(
        stateInstance,
        {},
        {
          accounts: {
            address: {
              getChecksumAddressString() {
                return checksumAddress;
              },
            },
          },
          web3: {
            activeNet: { id: 2 },
          },
        },
      );

      expect(transactions).toHaveLength(1);
    });
  });

  describe('pendingBalance', () => {
    it('should get pending balance correctly', () => {
      stateInstance.pendingTransactions = pendingTransactions;

      const pendingBalance = state.getters.pendingBalance(
        stateInstance,
        {},
        {
          accounts: {
            address: {
              getChecksumAddressString() {
                return checksumAddress;
              },
            },
          },
          web3: {
            activeNet: {
              id: 1,
            },
          },
        },
      );
      expect(pendingBalance).toBe('14');
    });

    it('should return zero pending balance with a nullable address', () => {
      stateInstance.pendingTransactions = [
        {
          from: '0x0',
          token: 'ETH',
          networkId: 1,
          state: 'pending',
          valueWei: '1',
          gasCost: '6',
        },
      ];

      const pendingBalance = state.getters.pendingBalance(
        stateInstance,
        {},
        {
          accounts: {
            address: null,
          },
        },
      );
      expect(pendingBalance).toBe('0');
    });
  });

  describe('filteredHistoryTransactions', () => {
    it('should filter trasactions correctly', () => {
      const duplicates = [
        {
          hash: '0x0asdf1',
        },
        {
          hash: '0x0asdf2',
        },
      ];
      stateInstance = {
        pendingTransactions: duplicates,
        transactionHistory: [
          ...duplicates,
          {
            hash: '0x0asdf3',
          },
          {
            hash: '0x0asdf4',
          },
        ],
      };

      const filteredTransactions = state.getters.filteredHistoryTransactions(
        stateInstance,
      );

      expect(filteredTransactions).toHaveLength(2);
      expect(filteredTransactions).not.toContainEqual(duplicates[0]);
    });
  });

  describe('incomingTransactions', () => {
    it('should return empty array', () => {
      const mockGetters = {
        currentNetTransactions: [
          {
            to: 1,
          },
          {
            to: 1,
          },
          {
            to: 2,
          },
        ],
      };
      const rootState = {
        accounts: {
          address: null,
        },
      };

      expect(
        state.getters.incomingTransactions(
          stateInstance,
          mockGetters,
          rootState,
        ),
      ).toEqual([]);
    });

    it('should return an array of addresses with to equal to active wallet addres', () => {
      const mockGetters = {
        currentNetTransactions: [
          {
            to: 1,
          },
          {
            to: 1,
          },
          {
            to: 2,
          },
        ],
      };
      const rootState = {
        accounts: {
          address: {
            getChecksumAddressString: jest.fn().mockReturnValue(1),
          },
        },
      };

      expect(
        state.getters.incomingTransactions(
          stateInstance,
          mockGetters,
          rootState,
        ),
      ).toEqual([
        {
          to: 1,
        },
        {
          to: 1,
        },
      ]);
    });
  });
  describe('currentNetTransactions', () => {
    it('should filter trasactions by network id', () => {
      const getters = {
        accountTransactions: [
          {
            networkId: 1,
          },
          {
            networkId: 1,
          },
          {
            networkId: 2,
          },
        ],
      };

      const transactions = state.getters.currentNetTransactions(null, getters, {
        web3: {
          activeNet: { id: 1 },
        },
      });

      expect(transactions).toHaveLength(2);
    });
  });

  describe('getPendingTransactions', () => {
    it('should return all pending transactions', () => {
      stateInstance.pendingTransactions = ethplorerTransactions;

      expect(state.getters.getPendingTransactions(stateInstance)).toEqual(
        stateInstance.pendingTransactions,
      );
    });
  });

  describe('getPendingTransactionByHash', () => {
    it('should return pending transaction by hash', () => {
      stateInstance.pendingTransactions = ethplorerTransactions;

      expect(
        state.getters.getPendingTransactionByHash(stateInstance)(
          '0x53d26efcde07f1b2b68f3e1de93b730deabd1094970d9a68efb799e048e00892',
        ),
      ).toEqual(stateInstance.pendingTransactions[0]);
    });
  });

  describe('getTransactionByHash', () => {
    it('should return transaction by hash', () => {
      stateInstance.transactionHistory = ethplorerTransactions;

      expect(
        state.getters.getTransactionByHash(stateInstance)(
          '0x1cfa3ef1695ab8035ff9abbee0637a8948af3c787b28341cc12a9a5bbb894555',
        ),
      ).toEqual(stateInstance.transactionHistory[1]);
    });
  });
});
