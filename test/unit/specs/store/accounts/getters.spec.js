import accountsGetters from '@/store/accounts/getters';
import { HARDWARE_WALLET_TYPE } from '@/constants';
import { v3 } from 'fixtures/accounts';

describe('Accounts getters', () => {
  describe('wallet', () => {
    it('should returns current wallet', () => {
      const state = {
        wallets: {
          [v3.address]: v3,
        },
        address: v3.address,
      };

      expect(accountsGetters.wallet(state)).toEqual(v3);
    });
  });

  describe('accountAddresses', () => {
    it('should return empty array', () => {
      const state = { wallets: {} };

      expect(accountsGetters.accountAddresses(state)).toEqual([]);
    });

    it('should return an array of addresses', () => {
      const state = { wallets: { '123': '321', '234': '432' } };

      expect(accountsGetters.accountAddresses(state)).toEqual(['123', '234']);
    });
  });

  describe('isPublicAccount', () => {
    it('should return true when the account is public', () => {
      const getters = {
        wallet: {
          isPublic: true,
        },
      };

      expect(accountsGetters.isPublicAccount(null, getters)).toBe(true);
    });

    it('should return false when the account is not public', () => {
      const getters = {
        wallet: {
          isPublic: false,
        },
      };

      expect(accountsGetters.isPublicAccount(null, getters)).toBeFalsy();
    });
  });

  describe('isHardwareAccount', () => {
    it('should return true when the account is hardware', () => {
      const getters = {
        wallet: {
          info: { type: HARDWARE_WALLET_TYPE.TREZOR },
        },
      };

      expect(accountsGetters.isHardwareAccount(null, getters)).toBe(true);
    });

    it('should return false when the account is not hardware', () => {
      const getters = {
        wallet: {
          info: { type: 'Foo' },
        },
      };

      expect(accountsGetters.isHardwareAccount(null, getters)).toBe(false);
    });
  });

  describe('balance', () => {
    it('should return null when the balance is null', () => {
      const state = { balance: null };

      expect(accountsGetters.balance(state)).toBe(null);
    });

    it('should calculate the balance', () => {
      const state = { balance: '123456789012345678' };
      const rootGetters = {
        'transactions/pendingBalance': '56789012345678',
      };

      expect(accountsGetters.balance(state, null, null, rootGetters)).toBe(
        '0.1234',
      );
    });
  });
});
