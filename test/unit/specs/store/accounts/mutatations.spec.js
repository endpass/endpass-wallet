import { v3, checksumAddress } from 'fixtures/accounts';
import { Address, Wallet } from '@/class';
import mutations from '@/store/accounts/mutations';
import {
  ADD_ADDRESS,
  SET_ADDRESS,
  ADD_WALLET,
  SET_WALLET,
  SET_HD_KEY,
  SET_BALANCE,
  SET_SETTINGS,
  SET_OTP_SETTINGS,
  SET_EMAIL,
} from '@/store/accounts/mutations-types';

describe('Accounts mutations', () => {
  describe(ADD_ADDRESS, () => {
    it('should add wallet', () => {
      const state = { wallets: {} };

      mutations[ADD_ADDRESS](state, checksumAddress);

      expect(state.wallets).toEqual({ [checksumAddress]: null });
    });
  });

  describe(SET_ADDRESS, () => {
    it('should set address', () => {
      const state = { address: null };
      const addressLC = checksumAddress.toLowerCase();

      mutations[SET_ADDRESS](state, addressLC);

      expect(state.address).toBeInstanceOf(Address);
      expect(state.address.getAddressString()).toBe(addressLC);
      expect(state.address.getChecksumAddressString()).toBe(checksumAddress);
    });
  });

  describe(SET_WALLET, () => {
    it('should set wallet', () => {
      const state = { wallet: null };
      const wallet = { id: 1 };

      mutations[SET_WALLET](state, wallet);

      expect(state.wallet).toEqual(wallet);
    });
  });

  describe(ADD_WALLET, () => {
    it('should add wallet', async () => {
      expect.assertions(2);

      const { address } = v3;
      const state = { wallets: {} };

      mutations[ADD_WALLET](state, v3);

      const wallet = state.wallets[address];
      const walletAddress = await wallet.getAddressString();

      expect(wallet).toBeInstanceOf(Wallet);
      expect(walletAddress).toBe(address);
    });
  });

  describe(SET_HD_KEY, () => {
    it('should set hd key', () => {
      const state = { hdKey: null };

      mutations[SET_HD_KEY](state, v3);

      expect(state.hdKey).toEqual(v3);
    });
  });

  describe(SET_BALANCE, () => {
    it('should set balance', () => {
      const state = { balance: null };
      const balance = '100';

      mutations[SET_BALANCE](state, balance);

      expect(state.balance).toBe(balance);
    });
  });

  describe(SET_SETTINGS, () => {
    it('should set settings', () => {
      const state = { settings: { fiatCurrency: 'USD' } };
      const settings = { fiatCurrency: 'GBR' };

      mutations[SET_SETTINGS](state, settings);

      expect(state.settings).toEqual(settings);
    });
  });

  describe(SET_OTP_SETTINGS, () => {
    it('should set otp settings', () => {
      const state = { otpSettings: null };
      const newOptSettings = {};

      mutations[SET_OTP_SETTINGS](state, newOptSettings);

      expect(state.otpSettings).toEqual(newOptSettings);
    });
  });

  describe(SET_EMAIL, () => {
    it('should set email', () => {
      const state = { email: null };
      const email = 'email@email.com';

      mutations[SET_EMAIL](state, email);

      expect(state.email).toEqual(email);
    });
  });
});
