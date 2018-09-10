import state from '@/store/transactions';
import { SET_TRANSACTION_HISTORY } from '@/store/transactions/mutations-types';
import ethplorerService from '@/services/ethplorer';
import { Transaction } from '@/class';

import { address } from 'fixtures/accounts';
import { ethplorerHistory, ethplorerTransactions } from 'fixtures/transactions';

const { actions } = state;

describe('transactions  actions', () => {
  let commit;
  let dispatch;
  let rootState;
  let rootGetters;

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
        wallet: {
          signTransaction: jest.fn(),
        },
      },
      web3: {
        activeNet: { id: 2 },
      },
    };
    rootGetters = {
      'transactions/pendingBalance': 0,
      'accounts/getAccountAddresses': [address.toLowerCase()],
      'web3/isMainNetwork': false,
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

      await actions.getTransactionHistory({
        dispatch,
        commit,
        rootState,
        rootGetters,
      });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit.mock.calls[0][0]).toBe(SET_TRANSACTION_HISTORY);
      expect(commit.mock.calls[0][1]).toHaveLength(4);
      expect(commit.mock.calls[0][1][0]).toBeInstanceOf(Transaction);
    });

    it('should handle errors', async () => {
      ethplorerService.getHistory = jest.fn().mockRejectedValue();
      ethplorerService.getInfo = jest.fn().mockRejectedValue();

      await actions.getTransactionHistory({
        dispatch,
        commit,
        rootState,
        rootGetters,
      });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch.mock.calls[0][0]).toBe('errors/emitError');
    });
  });

  describe('handleBlockTransactions', () => {
    it('should show notification of incoming transactions', () => {
      actions.handleBlockTransactions(
        { dispatch, rootState, rootGetters },
        ethplorerTransactions,
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch.mock.calls[0][0]).toBe('errors/emitError');
    });

    it('should update transaction history', () => {
      actions.handleBlockTransactions(
        {
          dispatch,
          rootState,
          rootGetters: {
            ...rootGetters,
            'web3/isMainNetwork': true,
          },
        },
        ethplorerTransactions,
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch.mock.calls[1][0]).toBe('getTransactionHistory');
    });
  });
});
