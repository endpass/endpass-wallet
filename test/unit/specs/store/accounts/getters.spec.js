import keystore from '@/utils/keystore';
import { hdv3, v3, v3password } from 'fixtures/accounts';
import getters from '@/store/accounts/getters';
import { Wallet, Address } from '@/class';

describe('Accounts getters', () => {
  describe('getAccountAddresses', () => {
    it('should return empty array', () => {
      const state = { wallets: {} };

      expect(getters.getAccountAddresses(state)).toEqual([]);
    });

    it('should return an array of addresses', () => {
      const state = { wallets: { '123': '321', '234': '432' } };

      expect(getters.getAccountAddresses(state)).toEqual(['123', '234']);
    });
  });

  describe('isPublicAccount', () => {
    it('should return true when the account is public', () => {
      const { address } = v3;
      const state = { wallet: new Address(address) };

      expect(getters.isPublicAccount(state)).toBeTruthy();
    });

    it('should return false when the account is not public', () => {
      const { address } = v3;
      const state = { wallet: new Wallet(v3) };

      expect(getters.isPublicAccount(state)).toBeFalsy();
    });
  });

  describe('balance', () => {
    it('should return null when the balance is null', () => {
      const state = { balance: null };

      expect(getters.balance(state)).toBe(null);
    });

    it('should calculate the balance', () => {
      const state = { balance: '123456789012345678' };
      const rootGetters = {
        'transactions/pendingBalance': '56789012345678',
      };

      expect(getters.balance(state, null, null, rootGetters)).toBe('0.1234');
    });
  });

  describe('hdWallet', () => {
    it('should return null when the hdKey is null', () => {
      const state = { hdKey: null };

      expect(getters.hdWallet(state)('pass')).toBe(null);
    });

    it('should return decrypt hd wallet', () => {
      const state = { hdKey: hdv3 };
      const hdKey = keystore.decryptHDWallet(v3password, hdv3);

      expect(getters.hdWallet(state)(v3password)).toEqual(hdKey);
    });
  });
});
