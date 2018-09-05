import state from '@/store/transactions';
import ethplorerService from '@/services/ethplorer';
import { address } from 'fixtures/accounts';
import { Transaction } from '@/class';
import { ethplorerHistory, ethplorerTransactions } from 'fixtures/transactions';

const { actions, mutations } = state;

describe('transactions store', () => {
  let stateInstance;
  beforeEach(() => {
    stateInstance = {
      pendingTransactions: [],
      transactionHistory: [],
    };
  });

  describe('getters', () => {
    describe('accountTransactions', () => {
      it('should get account transactions correctly', () => {
        stateInstance.pendingTransactions = [
          {
            to: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
            from: '0x4ce2109f8db1190cd44bc6554e35642214fbe144',
            state: 'success',
          },
          {
            to: '0x4ce2109f8db1190cd44bc6554e35642214fbe144',
            from: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
          },
          {
            to: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
            from: '0x4ce2109f8db1190cd44bc6554e35642214fbe144',
          },
        ];
        const transactions = state.getters.accountTransactions(
          stateInstance,
          {},
          {
            accounts: {
              address: {
                getChecksumAddressString() {
                  return '0x1cE2109F8db1190cD44bC6554e35642214fbE144';
                },
              },
            },
            web3: {
              activeNet: { id: 2 },
            },
          },
        );

        expect(transactions).toHaveLength(2);
        expect(transactions).toContainEqual(
          stateInstance.pendingTransactions[0],
        );
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
          pendingTransactions: [
            {
              to: '0x2ce2109f8db1190cd44bc6554e35642214fbe144',
              from: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
            },
          ],
        };

        const transactions = state.getters.accountTransactions(
          stateInstance,
          {
            filteredHistoryTransactions: [
              {
                to: '0x3ce2109f8db1190cd44bc6554e35642214fbe144',
                from: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
              },
            ],
          },
          {
            accounts: {
              address: {
                getChecksumAddressString() {
                  return '0x1cE2109F8db1190cD44bC6554e35642214fbE144';
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
          from: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
          date: new Date('01/01/2001'),
        };
        const trx2 = {
          to: '0x2ce2109f8db1190cd44bc6554e35642214fbe144',
          from: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
          date: new Date('01/01/2010'),
        };
        const trx3 = {
          to: '0x2ce2109f8db1190cd44bc6554e35642214fbe144',
          from: '0x1ce2109f8db1190cd44bc6554e35642214fbe144',
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
                  return '0x1cE2109F8db1190cD44bC6554e35642214fbE144';
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
    });

    describe('pendingBalance', () => {
      it('should get pending balance correctly', () => {
        stateInstance.pendingTransactions = [
          {
            from: '0x0',
            token: 'ETH',
            networkId: 1,
            state: 'pending',
            valueWei: '1',
            gasCost: '6',
          },
          {
            from: '0x0',
            token: 'ETH',
            networkId: 1,
            state: 'success',
            valueWei: '1',
            gasCost: '6',
          },
          {
            from: '0x0',
            token: 'ETH',
            networkId: 2,
            state: 'success',
            valueWei: '2',
            gasCost: '5',
          },
          {
            to: '0x1',
            token: 'ETH',
            networkId: 1,
            state: 'success',
            valueWei: '3',
            gasCost: '4',
            from: '0x2',
          },
        ];

        let pendingBalance = state.getters.pendingBalance(
          stateInstance,
          {},
          {
            accounts: {
              address: {
                getChecksumAddressString() {
                  return '0x0';
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
        expect(pendingBalance).toBe('7');
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

        const transactions = state.getters.currentNetTransactions(
          null,
          getters,
          {
            web3: {
              activeNet: { id: 1 },
            },
          },
        );

        expect(transactions).toHaveLength(2);
      });
    });
  });

  describe('actions', () => {
    let commit;
    let dispatch;
    let rootState;

    beforeEach(() => {
      commit = jest.fn();
      dispatch = jest.fn();
      rootState = {
        accounts: {
          address: {
            getChecksumAddressString: jest.fn(),
            getAddressString: () => address.toLowerCase(),
          },
          wallets: {
            [address]: {},
          },
        },
        web3: {
          activeNet: { id: 2 },
        },
      };
    });

    describe('handleSendingError', () => {
      it('should handle errors with undefined param', () => {
        actions.handleSendingError({ dispatch });

        expect(dispatch).toHaveBeenCalledTimes(1);
      });

      it('should handle errors with undefined err param', () => {
        actions.handleSendingError({ dispatch }, { err: undefined });

        expect(dispatch).toHaveBeenCalledTimes(1);
      });

      it('should handle errors with undefined transaction param', () => {
        actions.handleSendingError({ dispatch }, { transaction: undefined });

        expect(dispatch).toHaveBeenCalledTimes(1);
      });
    });

    describe('getTransactionHistory', () => {
      it('should recieve transaction history', async () => {
        ethplorerService.getHistory = jest
          .fn()
          .mockResolvedValue(ethplorerHistory);
        ethplorerService.getInfo = jest
          .fn()
          .mockResolvedValue(ethplorerTransactions);

        await actions.getTransactionHistory({ dispatch, commit, rootState });

        expect(commit).toHaveBeenCalledTimes(1);
        expect(commit.mock.calls[0][0]).toBe('setTransactionHistory');
        expect(commit.mock.calls[0][1]).toHaveLength(4);
        expect(commit.mock.calls[0][1][0]).toBeInstanceOf(Transaction);
      });

      it('should handle errors', async () => {
        ethplorerService.getHistory = jest.fn().mockRejectedValue();
        ethplorerService.getInfo = jest.fn().mockRejectedValue();

        await actions.getTransactionHistory({ dispatch, commit, rootState });

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe('errors/emitError');
      });
    });

    describe('handleBlockTransactions', () => {
      it('should show notification of incoming transactions', () => {
        actions.handleBlockTransactions(
          { dispatch, rootState },
          ethplorerTransactions,
        );

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch.mock.calls[0][0]).toBe('errors/emitError');
      });

      it('should update transaction history', () => {
        rootState = {
          ...rootState,
          web3: {
            activeNet: { id: 1 },
          },
        };

        actions.handleBlockTransactions(
          { dispatch, rootState },
          ethplorerTransactions,
        );

        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch.mock.calls[1][0]).toBe('getTransactionHistory');
      });
    });
  });

  describe('mutations', () => {
    describe('setTransactionHistory', () => {
      it('should set transaction history', () => {
        expect(stateInstance.transactionHistory).toHaveLength(0);

        mutations.setTransactionHistory(stateInstance, [{}, {}]);

        expect(stateInstance.transactionHistory).toHaveLength(2);
      });

      it('should set an empty array with the nullable parameter', () => {
        expect(stateInstance.transactionHistory).toEqual([]);

        mutations.setTransactionHistory(stateInstance, null);

        expect(stateInstance.transactionHistory).toEqual([]);
      });
    });
  });
});
