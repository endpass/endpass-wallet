import web3 from '@/utils/web3';
import keyUtil from '@/utils/keystore';
import {
  v3,
  v3password,
  mnemonic,
  hdv3,
  privateKeyString,
  checksumAddress,
} from 'fixtures/accounts';
import { Wallet, Address } from '@/class';
import actions from '@/store/accounts/actions';
import {
  SET_ADDRESS,
  SET_WALLET,
  ADD_WALLET,
  SET_HD_KEY,
  SET_BALANCE,
  SET_SETTINGS,
  SET_OTP_SETTINGS,
  SET_EMAIL,
  ADD_ADDRESS,
} from '@/store/accounts/mutations-types';
import {
  SAVE_TOKENS,
  SAVE_TRACKED_TOKENS,
} from '@/store/tokens/mutations-types';
import { userService } from '@/services';

describe('Accounts actions', () => {
  const email = 'email@email.com';
  let dispatch;
  let commit;

  beforeEach(() => {
    commit = jest.fn();
    dispatch = jest.fn();
    userService.setAccount = jest.fn();
    userService.setSetting = jest.fn();
  });

  describe('selectWallet', () => {
    const wallet = new Wallet(v3);
    const state = {
      wallets: {
        [checksumAddress]: wallet,
      },
    };

    it('should set wallet', () => {
      actions.selectWallet({ commit, dispatch, state }, checksumAddress);

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(1, SET_WALLET, wallet);
    });

    it('should set address', () => {
      actions.selectWallet({ commit, dispatch, state }, checksumAddress);

      expect(commit).toHaveBeenCalledTimes(2);
      expect(commit).toHaveBeenNthCalledWith(2, SET_ADDRESS, checksumAddress);
    });

    it('should update balance', () => {
      actions.selectWallet({ commit, dispatch, state }, checksumAddress);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'updateBalance');
    });

    it('should subscribe on token balance', () => {
      actions.selectWallet({ commit, dispatch, state }, checksumAddress);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(
        'tokens/subscribeOnTokensBalancesUpdates',
        null,
        { root: true },
      );
    });
  });

  describe('addWallet', () => {
    it('should add wallet to the store', async () => {
      expect.assertions(2);

      const address = checksumAddress.toLowerCase();

      await actions.addWallet({ commit, dispatch }, { ...v3, address });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toHaveBeenNthCalledWith(1, ADD_WALLET, v3);
    });

    it('should save the wallet through the user service', async () => {
      expect.assertions(3);

      const { address } = v3;

      await actions.addWallet({ commit, dispatch }, v3);

      expect(userService.setAccount).toHaveBeenCalledTimes(1);
      expect(userService.setAccount).toBeCalledWith(address, v3);
      expect(dispatch).toHaveBeenCalledTimes(0);
    });

    it('should handle errors from user service', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.setAccount.mockRejectedValue(error);

      await actions.addWallet({ commit, dispatch }, v3);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('addWalletAndSelect', () => {
    it('should add wallet', async () => {
      expect.assertions(2);

      const address = checksumAddress.toLowerCase();
      const wallet = { ...v3, address };

      await actions.addWalletAndSelect({ dispatch }, wallet);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'addWallet', wallet);
    });

    it('should select wallet', async () => {
      expect.assertions(2);

      const address = checksumAddress.toLowerCase();
      const wallet = { ...v3, address };

      await actions.addWalletAndSelect({ dispatch }, wallet);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith(
        'selectWallet',
        checksumAddress,
      );
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      dispatch.mockRejectedValueOnce(error);

      await actions.addWalletAndSelect({ commit, dispatch }, v3);

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(2, 'errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('addWalletWithV3', () => {
    it('should add wallet from v3 key store', async () => {
      expect.assertions(2);

      await actions.addWalletWithV3(
        { dispatch },
        {
          json: v3,
          password: v3password,
        },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('addWalletWithPrivateKey', {
        privateKey: privateKeyString,
        password: v3password,
      });
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      const spy = jest
        .spyOn(Wallet.prototype, 'getPrivateKeyString')
        .mockImplementation(() => {
          throw error;
        });

      await actions.addWalletWithV3({ commit, dispatch }, v3);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });

      spy.mockRestore();
    });
  });

  describe('addWalletWithPrivateKey', () => {
    it('should add wallet from private key', async () => {
      expect.assertions(2);

      await actions.addWalletWithPrivateKey(
        { dispatch },
        {
          privateKey: privateKeyString,
          password: v3password,
        },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'addWalletAndSelect',
        expect.objectContaining({
          address: checksumAddress,
        }),
      );
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      const spy = jest
        .spyOn(keyUtil, 'encryptWallet')
        .mockImplementation(() => {
          throw error;
        });

      await actions.addWalletWithPrivateKey(
        { commit, dispatch },
        {
          privateKey: privateKeyString,
          password: v3password,
        },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });

      spy.mockRestore();
    });
  });

  describe('addWalletWithPublicKey', () => {
    it('should add address from public key', async () => {
      expect.assertions(2);

      await actions.addWalletWithPublicKey(
        { commit, dispatch },
        checksumAddress,
      );

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(ADD_ADDRESS, checksumAddress);
    });

    it('should select wallet', async () => {
      expect.assertions(2);

      await actions.addWalletWithPublicKey(
        { commit, dispatch },
        checksumAddress,
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('selectWallet', checksumAddress);
    });

    it('should save wallet  via user service', async () => {
      expect.assertions(2);

      await actions.addWalletWithPublicKey(
        { commit, dispatch },
        checksumAddress,
      );

      expect(userService.setAccount).toHaveBeenCalledTimes(1);
      expect(userService.setAccount).toBeCalledWith(checksumAddress, null);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      const spy = jest
        .spyOn(userService, 'setAccount')
        .mockImplementation(() => {
          throw error;
        });

      await actions.addWalletWithPublicKey(
        { commit, dispatch },
        checksumAddress,
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });

      spy.mockRestore();
    });
  });

  describe('generateWallet', () => {
    it('should generate wallet from hd key', async () => {
      expect.assertions(2);

      const hdWallet = keyUtil.decryptHDWallet(v3password, hdv3);
      const state = { hdKey: {}, wallets: {} };
      const getters = {
        hdWallet: () => hdWallet,
      };

      await actions.generateWallet({ state, dispatch, getters }, v3password);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith(
        'addWalletAndSelect',
        expect.objectContaining({
          address: expect.any(String),
        }),
      );
    });

    it('should throw error when hdKey doesn`t exist', async () => {
      expect.assertions(2);

      const state = { hdKey: null };
      const getters = {};

      try {
        await actions.generateWallet({ state, dispatch, getters });
      } catch (e) {
        expect(e).toBeTruthy();
      }

      expect(dispatch).toHaveBeenCalledTimes(0);
    });
  });

  describe('saveHdWallet', () => {
    it('should save hd wallet through the user service', async () => {
      expect.assertions(2);

      userService.setAccount = jest.fn();

      await actions.saveHdWallet(null, v3);

      expect(userService.setAccount).toHaveBeenCalledTimes(1);
      expect(userService.setAccount).toBeCalledWith(checksumAddress, v3);
    });
  });

  describe('addHdWallet', () => {
    it('should set hd key', async () => {
      expect.assertions(2);

      const { address } = hdv3;

      await actions.addHdWallet(
        { commit, dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(
        SET_HD_KEY,
        expect.objectContaining({
          address,
        }),
      );
    });

    it('should save the hd wallet through the user service', async () => {
      expect.assertions(2);

      const { address } = hdv3;

      await actions.addHdWallet(
        { commit, dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'saveHdWallet',
        expect.objectContaining({
          address,
        }),
      );
    });

    it('should generate wallet', async () => {
      expect.assertions(2);

      await actions.addHdWallet(
        { commit, dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(2, 'generateWallet', v3password);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      dispatch.mockRejectedValueOnce(error);

      await actions.addHdWallet(
        { commit, dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('addMultiHdWallet', () => {
    beforeEach(() => {
      web3.eth.getBalance = jest.fn().mockResolvedValueOnce('5');
      web3.eth.getBalance.mockResolvedValueOnce('0');
    });

    it('should add wallets with balance and one more', async () => {
      expect.assertions(3);

      await actions.addMultiHdWallet(
        { dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(
        1,
        'addWalletAndSelect',
        expect.any(Object),
      );
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        'addWallet',
        expect.any(Object),
      );
    });

    it('should handle errors', async () => {
      expect.assertions(1);

      const error = new Error('error');
      web3.eth.getBalance = jest.fn().mockRejectedValueOnce(error);

      await actions.addMultiHdWallet(
        { commit, dispatch },
        { password: v3password, key: mnemonic },
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateBalance', () => {
    const state = { address: new Address(checksumAddress) };
    const balance = '5';

    beforeEach(() => {
      web3.eth.getBalance = jest.fn().mockResolvedValue(balance);
    });

    it('should set a new balance', async () => {
      expect.assertions(2);

      await actions.updateBalance({ commit, dispatch, state });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_BALANCE, balance);
    });

    it('should not update the balance if the address does not exist', async () => {
      expect.assertions(2);

      const state = { address: null };

      await actions.updateBalance({ commit, dispatch, state });

      expect(commit).toHaveBeenCalledTimes(0);
      expect(dispatch).toHaveBeenCalledTimes(0);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      web3.eth.getBalance.mockRejectedValueOnce(error);

      await actions.updateBalance({ dispatch, state });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('updateSettings', () => {
    const settings = { user: 'settings' };

    it('should set the settings', async () => {
      expect.assertions(2);

      await actions.updateSettings({ commit, dispatch }, settings);

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_SETTINGS, settings);
    });

    it('should save the settings through the user service', async () => {
      expect.assertions(2);

      await actions.updateSettings({ commit, dispatch }, settings);

      expect(userService.setSetting).toHaveBeenCalledTimes(1);
      expect(userService.setSetting).toBeCalledWith('settings', settings);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.setSetting.mockRejectedValueOnce(error);

      await actions.updateSettings({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('validatePassword', () => {
    const state = {
      wallet: {
        validatePassword: jest.fn().mockResolvedValue(true),
      },
    };
    const { validatePassword } = state.wallet;

    it('should validate the password', async () => {
      expect.assertions(2);

      const isValid = await actions.validatePassword({ state }, v3password);

      expect(validatePassword).toHaveBeenCalledTimes(1);
      expect(isValid).toBe(true);
    });

    it('should throw an error if the password is incorrect', async () => {
      expect.assertions(1);

      const error = new Error('error');
      validatePassword.mockRejectedValueOnce(error);

      try {
        await actions.validatePassword({ state }, v3password);
      } catch (e) {
        expect(e).toEqual(error);
      }
    });
  });

  describe('login', () => {
    userService.login = jest.fn();

    it('should login through the user service', async () => {
      expect.assertions(2);

      await actions.login({ commit, dispatch }, email);

      expect(userService.login).toHaveBeenCalledTimes(1);
      expect(userService.login).toBeCalledWith(email);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      userService.logout = jest.fn();
    });

    it('should reset the email', async () => {
      expect.assertions(2);

      await actions.logout({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_EMAIL, null);
    });

    it('should logout through the user service', async () => {
      expect.assertions(2);

      await actions.logout({ commit, dispatch });

      expect(userService.logout).toHaveBeenCalledTimes(1);
      expect(userService.logout).toBeCalledWith();
    });

    it('should reload the page', async () => {
      expect.assertions(2);

      const spy = jest.spyOn(window.location, 'reload');

      await actions.logout({ commit, dispatch });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toBeCalledWith();

      spy.mockRestore();
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.logout.mockRejectedValueOnce(error);

      await actions.logout({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('loginViaOTP', () => {
    const code = '123';
    userService.loginViaOTP = jest.fn();

    it('should otp login through the user service', async () => {
      expect.assertions(2);

      await actions.loginViaOTP({ commit, dispatch }, { email, code });

      expect(userService.loginViaOTP).toHaveBeenCalledTimes(1);
      expect(userService.loginViaOTP).toBeCalledWith(code, email);
    });
  });

  describe('getOtpSettings', () => {
    const otpSettings = { otp: true };
    userService.getOtpSettings = jest.fn().mockResolvedValue(otpSettings);

    it('should get the otp settings through the user service', async () => {
      expect.assertions(2);

      await actions.getOtpSettings({ commit, dispatch });

      expect(userService.getOtpSettings).toHaveBeenCalledTimes(1);
      expect(userService.getOtpSettings).toBeCalledWith();
    });

    it('should set the otp settings to store', async () => {
      expect.assertions(2);

      await actions.getOtpSettings({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_OTP_SETTINGS, otpSettings);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.getOtpSettings.mockRejectedValueOnce(error);

      await actions.getOtpSettings({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('setOtpSettings', () => {
    const secret = 'secret';
    const code = 'code';
    const otpSettings = { secret, code };
    userService.setOtpSettings = jest.fn();

    it('should save the otp settings through the user service', async () => {
      expect.assertions(2);

      await actions.setOtpSettings({ commit, dispatch }, otpSettings);

      expect(userService.setOtpSettings).toHaveBeenCalledTimes(1);
      expect(userService.setOtpSettings).toBeCalledWith(secret, code);
    });

    it('should enable the otp settings in the store', async () => {
      expect.assertions(2);

      await actions.setOtpSettings({ commit, dispatch }, otpSettings);

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_OTP_SETTINGS, { status: 'enabled' });
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.setOtpSettings.mockRejectedValueOnce(error);

      await actions.setOtpSettings({ commit, dispatch }, otpSettings);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('deleteOtpSettings', () => {
    const otpSettings = { code: 'code' };
    userService.deleteOtpSettings = jest.fn();

    it('should delete the otp settings through the user service', async () => {
      expect.assertions(2);

      await actions.deleteOtpSettings({ commit, dispatch }, otpSettings);

      expect(userService.deleteOtpSettings).toHaveBeenCalledTimes(1);
      expect(userService.deleteOtpSettings).toBeCalledWith(otpSettings.code);
    });

    it('should reset the otp settings in the store', async () => {
      expect.assertions(2);

      await actions.deleteOtpSettings({ commit, dispatch }, otpSettings);

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_OTP_SETTINGS, {});
    });

    it('should get the otp settings through the user service', async () => {
      expect.assertions(2);

      await actions.deleteOtpSettings({ commit, dispatch }, otpSettings);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('getOtpSettings');
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.deleteOtpSettings.mockRejectedValueOnce(error);

      await actions.deleteOtpSettings({ commit, dispatch }, otpSettings);

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('setUserSettings', () => {
    const settings = { setting: 'setting' };
    const tokens = [{ address: 'address1' }, { address: 'address2' }];
    userService.getSettings = jest
      .fn()
      .mockResolvedValue({ settings, tokens, email });

    it('should set the user email to the store', async () => {
      expect.assertions(2);

      await actions.setUserSettings({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(4);
      expect(commit).toHaveBeenNthCalledWith(1, SET_EMAIL, email);
    });

    it('should set the user settings to the store', async () => {
      expect.assertions(2);

      await actions.setUserSettings({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(4);
      expect(commit).toHaveBeenNthCalledWith(2, SET_SETTINGS, settings);
    });

    it('should set the tokens to the store', async () => {
      expect.assertions(2);

      await actions.setUserSettings({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(4);
      expect(commit).toHaveBeenNthCalledWith(
        3,
        `tokens/${SAVE_TOKENS}`,
        tokens,
        {
          root: true,
        },
      );
    });

    it('should set the tracked tokens to the store', async () => {
      expect.assertions(2);

      const tokenAddrs = tokens.map(({ address }) => address);

      await actions.setUserSettings({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(4);
      expect(commit).toHaveBeenNthCalledWith(
        4,
        `tokens/${SAVE_TRACKED_TOKENS}`,
        tokenAddrs,
        { root: true },
      );
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.getSettings.mockRejectedValueOnce(error);

      await actions.setUserSettings({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('setUserHdKey', () => {
    userService.getHDKey = jest.fn().mockResolvedValue(hdv3);

    it('should set the hd key to the store', async () => {
      expect.assertions(2);

      await actions.setUserHdKey({ commit, dispatch });

      expect(commit).toHaveBeenCalledTimes(1);
      expect(commit).toBeCalledWith(SET_HD_KEY, hdv3);
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      userService.getHDKey.mockRejectedValueOnce(error);

      await actions.setUserHdKey({ commit, dispatch });

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toBeCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });

  describe('init', () => {
    it('should set the user settings to the store', async () => {
      expect.assertions(2);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenNthCalledWith(1, 'setUserSettings');
    });

    it('should set the hd key to the store', async () => {
      expect.assertions(2);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenNthCalledWith(2, 'setUserHdKey');
    });

    it('should set the user accounts to the store', async () => {
      expect.assertions(2);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(3);
      expect(dispatch).toHaveBeenNthCalledWith(3, 'setUserWallets');
    });

    it('should handle errors', async () => {
      expect.assertions(2);

      const error = new Error('error');
      dispatch.mockRejectedValueOnce(error);

      await actions.init({ dispatch });

      expect(dispatch).toHaveBeenCalledTimes(4);
      expect(dispatch).toHaveBeenLastCalledWith('errors/emitError', error, {
        root: true,
      });
    });
  });
});
