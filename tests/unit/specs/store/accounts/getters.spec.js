import HDKey from 'ethereumjs-wallet/hdkey';
import Bip39 from 'bip39';

import accountsGetters from '@/store/accounts/getters';
import { v3, hdv3, mnemonic } from 'fixtures/accounts';

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
      const state = { wallets: { 123: '321', 234: '432' } };

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
          isHardware: true,
        },
      };

      expect(accountsGetters.isHardwareAccount(null, getters)).toBe(true);
    });

    it('should return false when the account is not hardware', () => {
      const getters = {
        wallet: {
          isHardware: false,
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

  describe('cache store', () => {
    const type = 'walletType';
    const otherType = 'otherType';
    const state = {
      hdCacheByType: {
        [type]: {
          xpub: hdv3.address,
          v3KeyStore: hdv3,
        },
      },
    };

    it('should return v3 keyStore', () => {
      expect(
        accountsGetters.cachedHdV3KeyStoreByType(state)(otherType),
      ).toBeUndefined();
      expect(
        accountsGetters.cachedHdV3KeyStoreByType(state)(type),
      ).toMatchObject(hdv3);
    });

    it('should return xpub address', () => {
      expect(
        accountsGetters.cachedXpubByType(state)(otherType),
      ).toBeUndefined();
      expect(accountsGetters.cachedXpubByType(state)(type)).toBe(hdv3.address);
    });

    it('should check stored keystore', () => {
      expect(accountsGetters.isHDv3WalletByType(state)(otherType)).toBe(false);
      expect(accountsGetters.isHDv3WalletByType(state)(type)).toBe(true);
    });
  });

  describe('getHdWalletBySeed', () => {
    it('should return hd wallet', () => {
      const hdWallet = HDKey.derivePath();

      HDKey.derivePath.mockClear();
      HDKey.derivePath.mockReturnValueOnce(hdWallet);

      const returnedWallet = accountsGetters.getHdWalletBySeed()(mnemonic);

      expect(Bip39.mnemonicToSeed).toHaveBeenCalledTimes(1);
      expect(Bip39.mnemonicToSeed).toHaveBeenCalledWith(mnemonic);

      expect(HDKey.derivePath).toHaveBeenCalledTimes(1);
      expect(HDKey.derivePath).toHaveBeenCalledWith(ENV.hdKeyMnemonic.path);

      expect(hdWallet).toEqual(returnedWallet);
    });
  });
});
